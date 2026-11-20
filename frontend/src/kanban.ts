import type {Task,TaskStatus} from './types';
import type {PendingMutation} from './api';

export const STATUS_LABELS:Record<TaskStatus,string>={todo:'A fazer',in_progress:'Em progresso',done:'Concluída'};
export const TASK_STATUSES:TaskStatus[]=['todo','in_progress','done'];

/** Roll back only our attempted status, preserving other updated task fields. */
export function restoreTaskStatus(tasks:Task[],id:number,attempted:TaskStatus,previous:TaskStatus){
  return tasks.map(task=>task.id===id&&task.status===attempted?{...task,status:previous}:task);
}

export function pendingStatusTasks(requests:Pick<PendingMutation,'url'|'method'>[]){
  const ids=new Set<number>();
  for(const request of requests){
    const match=request.url.match(/^\/tasks\/(\d+)\/status$/);
    if(match&&request.method==='PATCH')ids.add(Number(match[1]));
  }
  return ids;
}
