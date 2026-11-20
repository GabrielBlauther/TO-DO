import {expect,test} from 'bun:test';
import {boundPanel,cornerPosition} from '../frontend/src/focus-panel-position';

test('painel limita arraste e teclado a todos os lados da área visível',()=>{
  const view={left:0,top:0,width:1280,height:900},size={width:300,height:230};
  expect(boundPanel({x:-200,y:-500},size,view)).toEqual({x:8,y:8});
  expect(boundPanel({x:4000,y:5000},size,view)).toEqual({x:972,y:662});
  expect(boundPanel({x:250,y:100},size,view)).toEqual({x:250,y:100});
  expect(boundPanel({x:NaN,y:Infinity},size,view)).toEqual({x:972,y:662});
});
test('quatro posições e redução da tela preservam acesso ao painel sem alterar timer',()=>{
  const size={width:300,height:230},mobile={left:0,top:0,width:390,height:844};
  expect(cornerPosition('top-left',size,mobile)).toEqual({x:8,y:8});
  expect(cornerPosition('top-right',size,mobile)).toEqual({x:82,y:8});
  expect(cornerPosition('bottom-left',size,mobile)).toEqual({x:8,y:606});
  expect(cornerPosition('bottom-right',size,mobile)).toEqual({x:82,y:606});
  expect(boundPanel({x:972,y:662},size,mobile)).toEqual({x:82,y:606});
  const keyboard={left:20,top:100,width:350,height:320};
  expect(boundPanel({x:972,y:662},size,keyboard)).toEqual({x:62,y:182});
});
