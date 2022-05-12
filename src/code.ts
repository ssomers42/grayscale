//ignore invisible nodes
figma.skipInvisibleInstanceChildren = true;

//create rectangle and add it to canvas at 0, 0

//set filterLayer's fill and blend mode, lock the layer, and resize to the same size as the target
//move the layer to the target location if it is not in a frame
let defineFilterLayer = (target, filterLayer) => {
  const targetWidth = target.width;
  const targetHeight = target.height;

  filterLayer.fills = [
    {
      blendMode: 'SATURATION',
      color: {
        r: 0,
        g: 0,
        b: 0,
      },
      opacity: 1,
      type: 'SOLID',
    },
  ];
  filterLayer.locked = true;
  filterLayer.resize(targetWidth, targetHeight);
  filterLayer.name = 'Grayscale filter';

  //if the target layer is not a frame, and is not nested in a frame, add the filter to the layer location
  if (isFrame(target) === false) {
    filterLayer.x = target.x;
    filterLayer.y = target.y;
  }
};

//determine if target has a frame
//call function recursively until a FRAME or PAGE node is found.
let hasFrame = (focus) => {
  if (focus.type === 'FRAME' || focus.parent.type === 'FRAME') {
    console.log('frame found!');
    return true;
  } else if (focus.parent.type != 'PAGE') {
    focus = focus.parent;
    hasFrame(focus);
  } else return false;
};

let isFrame = (focus) => {
  if (focus.type === 'FRAME') {
    console.log('frame found!');
    return true;
  } else return false;
};

//if target is a frame, add rectangle as the top layer of the frame. Otherwise, add it one layer above selection.
let placeRectangle = (target) => {
  let filterLayer = figma.createRectangle();
  defineFilterLayer(target, filterLayer);
  if (target.type === 'FRAME') {
    const length = target.children.length;
    target.insertChild(length, filterLayer);
  } else {
    //get index of selection IF NOT frame
    const index = target.parent.children.indexOf(target);
    target.parent.insertChild(index + 1, filterLayer);
  }
};

let removeAll = () => {
  const filters = figma.currentPage
    .findAllWithCriteria({
      types: ['RECTANGLE'],
    })
    .forEach((rectangle) => {
      if (rectangle.name == 'Grayscale filter') {
        console.log(rectangle);
        rectangle.remove();
      }
    });
};

if (figma.command === 'grayscale') {
  //store the user selection
  const target = figma.currentPage.selection;

  target.forEach((target) => {
    placeRectangle(target);
  });
} else if (figma.command === 'removeAll') {
  removeAll();
}

figma.closePlugin();
