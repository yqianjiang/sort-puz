class WaterTubes {
  constructor(config, nEmpty) {
    this.data = [];
    this.history = [];
    this._historyData = [];
    this._redoHistory = [];
    this._nLayers = 4;
    this.updateData(config, nEmpty);
    this.initial = JSON.parse(JSON.stringify(this.data));
  }

  updateData(config, nEmpty) {
    this.data = [];
    this._nLayers = config[0].length;
    for (let i = 0; i < config.length; i++) {
      if (typeof config[i][0] === "number") {
        this.data[i] = config[i].map((idx) => COLORS[idx]);
      } else {
        this.data[i] = [...config[i]];
      }
    }
    for (let i = 0; i < nEmpty; i++) {
      this.data[config.length + i] = ["", "", "", ""];
    }
  }

  getFirst(row) {
    let i = 0;
    let result;
    while (!result && i < this.data[row].length) {
      result = this.data[row][i];
      i++;
    }
    return [result, i - 1];
  }

  pop(row) {
    const [result, idx] = this.getFirst(row);
    if (result && idx < this.data[row].length) {
      this.data[row][idx] = null;
    }
    return result;
  }

  push(row, newItem) {
    const arr = this.data[row];
    for (let i = arr.length - 1; i >= 0; i--) {
      if (!arr[i]) {
        arr[i] = newItem;
        break;
      }
    }
  }

  canMove(from, to) {
    const [existColor, j] = this.getFirst(to);
    if (!existColor) return true; // 空的，任何颜色都可以
    if (!j) return false; // 满的，任何颜色都不行

    // 有空位，需要判断颜色是否相同
    const [toMoveColor, idx] = this.getFirst(from);
    if (toMoveColor === existColor) {
      return true;
    }
  }

  _move(from, to) {
    const color = this.pop(from);
    this.push(to, color);
    return color;
  }

  move(from, to) {
    if (!this.canMove(from, to)) return;
    let color;
    let count = 0;
    while (this.canMove(from, to)) {
      color = this._move(from, to);
      count++;
    }
    if (color) {
      this.history.push({ from, to, count, color });
      this._redoHistory = [];
    }
  }

  undo() {
    if (!this.history.length) return;
    const history = this.history.pop();
    this._redoHistory.push(history);
    const { from, to, count } = history;
    for (let i = 0; i < count; i++) {
      this._move(to, from);
    }
  }

  redo() {
    if (!this._redoHistory.length) return;
    const { from, to, count } = this._redoHistory.pop();
    let color;
    for (let i = 0; i < count; i++) {
      color = this._move(from, to);
    }
    this.history.push({ from, to, count, color });
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(this.initial));
    // 没有重置history, 会影响undo, redo那些
  }

  get isSorted() {
    for (const arr of this.data) {
      if (!this.ifArrIsSorted(arr)) {
        return false;
      }
    }
    return true;
  }

  ifArrIsSorted(arr) {
    const color = arr[0];
    for (const item of arr) {
      if (item !== color) {
        return false;
      }
    }
    return true;
  }

  checkData() {
    // 检查总共有几种颜色，每种颜色次数是否相等
    const countMap = {};
    for (const arr of this.data) {
      for (const item of arr) {
        if (countMap[item]) {
          countMap[item]++;
        } else {
          countMap[item] = 1;
        }
      }
    }
    const vari = new Set(Object.values(countMap));
    for (const num of vari) {
      if (num % this._nLayers > 0) {
        console.log("题目不符合规定，请检查");
        return false;
      }
    }
    return true;
  }

  solve() {
    if (!this.checkData()) {
      return false;
    }

    const dfs = () => {
      // 检查是否已经全分类好了
      if (this.isSorted) return true;

      // 不走重复的状态
      if (this._historyData.includes(JSON.stringify(this.data))) {
        return false;
      }
      this._historyData.push(JSON.stringify(this.data));

      // 遍历找到可以的from, to
      for (let from = 0; from < this.data.length; from++) {
        // 不再移动已经排好的管子
        if (this.ifArrIsSorted(this.data[from])) continue;

        for (let to = 0; to < this.data.length; to++) {
          if (from === to || !this.canMove(from, to)) {
            continue;
          }

          // 试走这一步，如果最后走不通就undo（回溯）
          this.move(from, to);
          if (dfs()) {
            return true;
          } else {
            this.undo();
          }
        }
      }

      return false;
    };

    if (dfs()) {
      // TODO: 动画重走一遍history
    } else {
      console.log('无解');
    }
  }
}
