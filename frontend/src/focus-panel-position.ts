export type PanelPosition = {x:number;y:number};
export type PanelSize = {width:number;height:number};
export type PanelViewport = PanelSize & {left:number;top:number};
export type PanelCorner = 'top-left'|'top-right'|'bottom-left'|'bottom-right';

export function boundPanel(position:PanelPosition,size:PanelSize,viewport:PanelViewport):PanelPosition {
  const gap=Math.min(8,viewport.width/2,viewport.height/2);
  const minX=viewport.left+gap,minY=viewport.top+gap;
  const maxX=Math.max(minX,viewport.left+viewport.width-size.width-gap);
  const maxY=Math.max(minY,viewport.top+viewport.height-size.height-gap);
  return {x:Math.max(minX,Math.min(maxX,Number.isFinite(position.x)?position.x:maxX)),
    y:Math.max(minY,Math.min(maxY,Number.isFinite(position.y)?position.y:maxY))};
}
export function cornerPosition(corner:PanelCorner,size:PanelSize,viewport:PanelViewport):PanelPosition {
  return boundPanel({x:viewport.left+(corner.endsWith('right')?viewport.width:0),
    y:viewport.top+(corner.startsWith('bottom')?viewport.height:0)},size,viewport);
}
