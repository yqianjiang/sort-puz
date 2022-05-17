class WaterTubes {
  constructor(config, nEmpty) {
    this.data = [];
    this.nLayers = 4;
    this.history = [];
    this._historyData = [];
    this._redoHistory = [];
    this.updateData(config, nEmpty);
    this.initial = JSON.parse(JSON.stringify(this.data));
    this.solveSteps = null;
  }

  updateData(config, nEmpty) {
    this.data = JSON.parse(JSON.stringify(config));
    this.nLayers = config[0].length;
    for (let i = 0; i < nEmpty; i++) {
      this.data[config.length + i] = [];
    }
  }

  loadData(data, history, nLayers) {
    this.data = data;
    this.nLayers = nLayers;
    this.history = history;
    this._historyData = [];
    this._redoHistory = [];
    this.initial = JSON.parse(JSON.stringify(this.data));
  }

  getFirst(row) {
    return this.data[row][this.data[row].length - 1];
  }

  pop(row) {
    return this.data[row].pop();
  }

  push(row, newItem) {
    this.data[row].push(newItem);
  }

  canMove(from, to) {
    if (!this.data[to].length) return true; // 空的，任何颜色都可以
    if (this.data[to].length === this.nLayers) return false; // 满的，任何颜色都不行

    // 有空位，需要判断颜色是否相同
    const existColor = this.getFirst(to);
    const toMoveColor = this.getFirst(from);
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
    if (!this.canMove(from, to)) return false;
    let color;
    let count = 0;
    while (this.canMove(from, to)) {
      color = this._move(from, to);
      count++;
    }
    if (count) {
      this.history.push({ from, to, count, color });
      this._redoHistory = [];
      return true;
    }
    return false;
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
    while (this.history.length) {
      this.undo();
    }
  }

  get isSorted() {
    for (const arr of this.data) {
      if (!this.ifArrIsSorted(arr)) {
        return false;
      }
    }
    return true;
  }

  ifArrIsUnique(arr) {
    const set = new Set(arr);
    return set.size === 1;
  }

  ifArrIsSorted(arr) {
    if (arr.length === 0) return true;
    if (arr.length !== this.nLayers) return false;
    return this.ifArrIsUnique(arr);
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
      if (num % this.nLayers > 0) {
        console.log("题目不符合规定，请检查");
        return false;
      }
    }
    return true;
  }

  solve() {
    if (this.solveSteps) {
      let hasChange = false;
      while (this.solveSteps.length > this.history.length) {
        const { from, to } = this.solveSteps[this.history.length];
        if (!this.move(from, to)) {
          hasChange = true;
          break;
        }
      }
      if (!hasChange) {
        return "";
      }
    }

    if (!this.checkData()) {
      return "数据不符合格式";
    }

    const compressData = () => this.data.join(";");
    // const compressData = () => JSON.stringify(this.data);

    let nDfsCall = 0;
    const nMaxCall = 15686; // 65686次大概会卡5535ms；103226次大约会卡14598ms
    const dfs = () => {
      if (nDfsCall > nMaxCall) return false;
      nDfsCall++;
      // 检查是否已经全分类好了
      if (this.isSorted) return true;

      // 不走重复的状态
      if (this._historyData.includes(compressData())) {
        return false;
      }
      this._historyData.push(compressData());

      // 遍历找到可以的from, to
      for (let from = 0; from < this.data.length; from++) {
        // 不再移动已经排好的管子
        const fromArr = this.data[from];
        if (this.ifArrIsSorted(fromArr)) continue;

        for (let to = 0; to < this.data.length; to++) {
          if (from === to || !this.canMove(from, to)) {
            continue;
          }
          const toArr = this.data[to];

          // 颜色完全相同的from不移动到空白的to
          if (this.ifArrIsUnique(fromArr) && !toArr.length) {
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
      console.log(nDfsCall);
      this.solveSteps = JSON.parse(JSON.stringify(this.history));
      return "";
    } else if (nDfsCall < nMaxCall) {
      console.log(nDfsCall);
      console.log("无解");
      return "无解";
    } else {
      console.log(nDfsCall);
      console.log("超时");
      return "超时";
    }
  }
}
