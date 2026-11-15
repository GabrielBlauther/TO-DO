import { Task, Comment, Category, Priority, TaskFormData, TaskStatus, Subject, SessionFormData } from './types';
import type { FocusRequest, FocusResult } from '../../shared/focus';
import {formatDate} from '../../shared/planning';

const BASE_URL = '/api';
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export class UncertainError extends Error {}
export type PendingMutation = {key:string;url:string;method:string;body?:string;label:string};
const PENDING='todo.mutations.pending.v1';
const attempts=new Map<string,string>();
const taskNames=new Map<number,string>();
// Keep the exact request across a lost response, navigation and reload.
export function pendingMutations():PendingMutation[] {
  let raw:string|null;
  try{raw=sessionStorage.getItem(PENDING);}catch{throw new Error('Não foi possível acessar os pedidos pendentes neste navegador. Preserve esta aba e confira o planejamento antes de repetir cadastros. Verifique se o navegador permite armazenamento para este endereço.');}
  if(!raw)return [];
  let value:unknown;
  try{value=JSON.parse(raw);}catch{throw new Error('Não foi possível ler os pedidos pendentes: o registro deste navegador está danificado. Preserve esta aba e confira os dados no planejamento antes de repetir cadastros. Não limpe os registros de confirmação sem conferir o resultado.');}
  if(!Array.isArray(value)||value.some(p=>!p||typeof p.key!=='string'||typeof p.url!=='string'||!p.url.startsWith('/')||typeof p.method!=='string'||!['POST','PUT','PATCH','DELETE'].includes(p.method)||typeof p.label!=='string'||(p.body!==undefined&&typeof p.body!=='string')))throw new Error('Não foi possível ler os pedidos pendentes deste navegador. Preserve esta aba e confira o planejamento antes de repetir cadastros.');
  return value;
}
function remember(item:PendingMutation,remove=false){
  const list=pendingMutations().filter(p=>p.key!==item.key);
  if(!remove)list.push(item);
  sessionStorage.setItem(PENDING,JSON.stringify(list));window.dispatchEvent(new Event('todo-mutations'));
}
function operation(url:string,method:string,body?:string){
  if(url==='/focus/confirm')return 'confirmar o estudo e reorganizar o planejamento';
  const data=body?JSON.parse(body):{};
  const object=url.includes('/comments')?'comentário':url.includes('/sessions')?'estudo planejado':url.includes('/subjects')?'disciplina':'atividade';
  const verb=method==='DELETE'?'excluir':method==='POST'?'cadastrar':'atualizar';
  const taskId=url.match(/^\/tasks\/(\d+)/)?.[1];
  const name=data.title||data.name||data.text||(taskId?taskNames.get(Number(taskId)):null);
  const schedule=data.planned_date?` em ${formatDate(data.planned_date)}${data.start_time?` às ${data.start_time}`:' (sem horário)'}`:'';
  return `${verb} ${object}${name?` “${String(name).slice(0,100)}”`:''}${schedule}`;
}
export async function retryMutation(item:PendingMutation){
  return request(item.url,{method:item.method,body:item.body},item);
}
async function checkRecoverySupport(label:string){
  let response:Response;
  try{response=await fetch(`${BASE_URL}/tasks`,{method:'OPTIONS',signal:AbortSignal.timeout(15000)});}
  catch{throw new Error(`Não foi possível preparar o pedido de ${label}: o serviço de dados não respondeu. Nenhuma nova gravação foi enviada nesta tentativa; pedidos anteriores podem estar salvos. Tente verificar novamente quando o serviço responder.`);}
  if(!response.ok||response.headers.get('X-Write-Recovery')!=='1')throw new Error(`Não foi possível preparar o pedido de ${label}: o serviço conectado não confirmou suporte à recuperação segura. Nenhuma nova gravação foi enviada nesta tentativa; pedidos anteriores podem estar salvos. Reinicie o servidor com a versão atual do projeto e tente verificar novamente.`);
}

async function request<T>(url: string, options?: RequestInit, retry?:PendingMutation): Promise<T> {
  const method=options?.method||'GET',body=options?.body as string|undefined;
  const mutation=method!=='GET' && url!=='/focus/confirm';
  const identity=JSON.stringify({url,method,body});
  const label=operation(url,method,body);
  const recovery=url==='/focus/confirm'?'Verificar confirmação pendente':'Verificar resultado';
  let item:PendingMutation|undefined;
  // A running old backend must not silently ignore the receipt key.
  if(method!=='GET')await checkRecoverySupport(label);
  if(mutation){
    item=retry||pendingMutations().find(p=>p.url===url&&p.method===method&&p.body===body)||{key:attempts.get(identity)||crypto.randomUUID(),url,method,body,label};
    attempts.set(identity,item.key);remember(item);
  }
  let res:Response;
  try {res=await fetch(`${BASE_URL}${url}`, {...options,signal:options?.signal||AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',...(item?{'X-Request-Key':item.key}:{})}});}
  catch {throw new UncertainError(method==='GET'?'Não foi possível consultar os dados. A causa não foi identificada. Os dados exibidos podem estar desatualizados. Tente carregar novamente.':`Não foi possível confirmar o resultado de ${label}. O pedido pode ter sido salvo. Seus dados foram preservados; use ${recovery} para repetir o mesmo pedido com segurança.`);}
  if(res.status>=500){
    if(method==='GET')throw new Error('Não foi possível consultar os dados: o serviço retornou uma falha. Os dados exibidos podem estar desatualizados. Tente carregar novamente.');
    throw new UncertainError(`Não foi possível confirmar o resultado de ${label}: o serviço retornou uma falha. O pedido pode ter sido salvo. Use ${recovery} para conferir sem duplicar.`);
  }
  if (!res.ok) {
    if(item){remember(item,true);attempts.delete(identity);}
    const error = await res.json().catch(() => ({ error: 'Não foi possível concluir a operação.' }));
    throw new ApiError(method==='GET'?`Não foi possível consultar os dados. ${error.error} Tente carregar novamente.`:`Não foi possível ${label}. ${error.error} Este pedido não foi aplicado. Revise os campos e tente novamente.`,res.status);
  }
  let result:T;
  try{result=await res.json();}catch{
    if(method==='GET')throw new Error('Não foi possível ler os dados recebidos. Os dados exibidos podem estar desatualizados. Tente carregar novamente.');
    throw new UncertainError(`Não foi possível ler a confirmação de ${label}. O resultado é incerto. Verifique o mesmo pedido antes de repetir ou alterar os dados.`);
  }
  if(item){remember(item,true);attempts.delete(identity);}
  if(url.startsWith('/tasks'))for(const value of Array.isArray(result)?result:[result]){
    if(value&&typeof value==='object'&&'id' in value&&'title' in value&&typeof value.id==='number'&&typeof value.title==='string')taskNames.set(value.id,value.title);
  }
  return result;
}

// Tasks
export const getTasks = () => request<Task[]>('/tasks');
export const getTask = (id: number) => request<Task>(`/tasks/${id}`);
export const createTask = (data: TaskFormData) =>
  request<Task>('/tasks', { method: 'POST', body: JSON.stringify({ ...data, status: 'todo' }) });
export const updateTask = (id: number, data: Partial<TaskFormData & { status: TaskStatus }>) =>
  request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateTaskStatus = (id: number, status: TaskStatus) =>
  request<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteTask = (id: number) =>
  request<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' });

// Comments
export const getComments = (taskId: number) => request<Comment[]>(`/tasks/${taskId}/comments`);
export const addComment = (taskId: number, text: string) =>
  request<Comment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
export const deleteComment = (id: number) =>
  request<{ success: boolean }>(`/comments/${id}`, { method: 'DELETE' });

// Categories & Priorities
export const getCategories = () => request<Category[]>('/categories');
export const getPriorities = () => request<Priority[]>('/priorities');

export const getSubjects = () => request<Subject[]>('/subjects');
export const createSubject = (name: string) => request<Subject>('/subjects', { method: 'POST', body: JSON.stringify({ name }) });
export const saveSession = (taskId: number, data: SessionFormData, sessionId?: number) =>
  request<Task>(`/tasks/${taskId}/sessions${sessionId ? `/${sessionId}` : ''}`, { method: sessionId ? 'PUT' : 'POST', body: JSON.stringify(data) });
export const deleteSession = (taskId: number, sessionId: number) =>
  request<Task>(`/tasks/${taskId}/sessions/${sessionId}`, { method: 'DELETE' });
export const confirmFocus = (data: FocusRequest) => request<FocusResult>('/focus/confirm',{method:'POST',body:JSON.stringify(data)});
