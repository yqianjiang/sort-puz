const { createApp, ref, computed } = Vue;
const COLORS = [
  "red",
  "green",
  "blue",
  "gray",
  "purple",
  "yellow",
  "pink",
  "orange",
  "brown",
];

createApp({
  setup() {
    const nTubes = ref(9);
    const activeTube = ref(null);
    const arrLists = ref([]);
    const config = [
      [2, 8, 6, 4],
      [0, 2, 2, 4],
      [1, 3, 6, 1],
      [6, 0, 4, 4],
      [6, 2, 8, 3],
      [0, 8, 1, 1],
      [8, 3, 0, 3],
    ];

    const initArrLists = () => {
      for (let i = 0; i < nTubes.value; i++) {
        if (i < config.length) {
          arrLists.value[i] = config[i].map((idx) => COLORS[idx]);
        } else {
          arrLists.value[i] = ["", "", "", ""];
        }
      }
    };

    /**
     * 尝试从第idx管中拿出液体（获取要拿出的列表，但不是真的拿出来）
     * @param {*} idx
     * @returns
     */
    const pop = (idx) => {
      let j = 0;
      const result = [];
      while (!result.length && j < arrLists.value[idx].length) {
        const color = arrLists.value[idx][j];
        if (color) {
          result.push(color);
        }
        j++;
      }
      while (j < arrLists.value[idx].length) {
        const color = arrLists.value[idx][j];
        if (color === result[0]) {
          result.push(color);
          j++;
        } else {
          j = arrLists.value[idx].length;
        }
      }
      return result;
    };

    const push = (idx, newItems) => {
      const arr = arrLists.value[idx];
      for (let i = arr.length - 1; i >= 0; i--) {
        if (!arr[i]) {
          arr[i] = newItems.pop() || "";
        }
      }
    };

    /**
     * 判断"from管"液体能否倒入"to管"
     * @param {number} fromI from管的idx
     * @param {number} toI   to管的idx
     * @returns {object} {move: boolean, j: number, toMoveColors: string[]}
     */
    const canMove = (fromI, toI) => {
      const toMoveColors = pop(fromI);
      let j = 0;
      let targetTopColor;
      while (!targetTopColor && j < arrLists.value[toI].length) {
        targetTopColor = arrLists.value[toI][j];
        j++;
      }
      return {
        move:
          (toMoveColors[0] === targetTopColor ||
            j === arrLists.value[toI].length) &&
          toMoveColors.length < j,
        j,
        toMoveColors,
      };
    };

    const handleClickTube = (idx) => {
      if (activeTube.value === null) {
        activeTube.value = idx;
      } else if (activeTube.value === idx) {
        activeTube.value = null;
      } else {
        const { move, toMoveColors } = canMove(activeTube.value, idx);
        if (move) {
          console.log('toMoveColors', toMoveColors);
          const activeArr = arrLists.value[activeTube.value];
          for (const i in toMoveColors) {
            let j = activeArr.findIndex((x) => x);
            activeArr[j] = "";
          }
          push(idx, toMoveColors);
          activeTube.value = null;
        } else {
          activeTube.value = idx;
        }
      }
    };

    initArrLists();

    return {
      nTubes,
      arrLists,
      activeTube,
      handleClickTube,
    };
  },
}).mount("#app");
