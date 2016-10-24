import random from 'lodash/random'

const primaryColors = [
  [0, 255, 221],
  [222, 75, 75],
  [218, 38, 104],
  [107, 187, 255],
  [237, 98, 130],
  [249, 103, 137],
  [241, 142, 178],
  [253, 85, 92],
  [112, 70, 214],
  [59, 204, 133],
  [255, 116, 35],
  [83, 243, 176],
  [254, 140, 127],
  [31, 172, 255],
  [0, 208, 255],
  [88, 155, 255],
  [83, 243, 176],
  [84, 218, 164],
  [255, 139, 139],
  [22, 124, 128],
  [191, 181, 215],
  [240, 207, 97],
  [55, 23, 34],
  [229, 112, 102],
]

export function randomColor() {
  return primaryColors[random(0, primaryColors.length - 1)]
}

export function randomColorString() {
  const colorAttrs = randomColor();
  return `rgba(${colorAttrs[0]},${colorAttrs[1]},${colorAttrs[2]}, 1)`
}