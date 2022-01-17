<template>
  <div></div>
</template>
<script>
export default {
  data() {
    return {};
  },
  mounted() {
    let arr = [10, 2, -5];
    // let arr = [5, 10, -5];
    // let arr = [-2, -1, 1, 2];
    // let arr = [8, -8];
    let result = this.asteroidCollision2(arr);
    console.log(result);
  },
  methods: {
    // 栈思想方法
    asteroidCollision2(asteroids) {
      let arr = [];
      for (let i = 0; i < asteroids.length; i++) {
        if (arr.length == 0) {
          arr.push(asteroids[i]);
        } else {
          let isPush = true; // 判断是否将新元素放入数组
          // 只有当左边数>0,右边数<0时才发生碰撞
          while (arr.length != 0 && arr[arr.length - 1] * asteroids[i] < 0) {
            if (arr[arr.length - 1] > 0 && asteroids[i] < 0) {
              // 相向 碰撞
              let absL = Math.abs(arr[arr.length - 1]);
              let absR = Math.abs(asteroids[i]);
              if (absL > absR) {
                // 左边能量大
                isPush = false;
                break;
              } else if (absL == absR) {
                // 左右能量相等
                arr.pop();
                isPush = false;
                break;
              } else {
                // 右边能量大
                arr.pop();
                isPush = true;
                // arr.push(asteroids[i]);
              }
            } else {
              break;
            }
          }
          if (isPush) {
            arr.push(asteroids[i]);
          }
        }
      }
      return arr;
    },
    asteroidCollision1(asteroids) {
      let arr = [];
      if (asteroids[0]) {
        arr.push(asteroids[0]);
      }
      let b = false; // 记录是否发生碰撞
      for (let i = 1; i < asteroids.length; i++) {
        let left = arr[arr.length - 1];
        const right = asteroids[i];
        const m = left * right;
        if (m > 0) {
          // 同向
          // 不会发生碰撞
          arr.push(right);
        } else {
          // 相向 or 反向
          if (left < 0 && right > 0) {
            // 相反方向
            // 但不会碰撞
            arr.push(right);
          } else {
            b = true;
            // 对向运行 碰撞
            // 对向运行 碰撞
            let absL = Math.abs(left);
            let absR = Math.abs(right);
            if (absL > absR) {
              // 左面能量大
            } else if (absL == absR) {
              // 左右能量相等
              arr.pop();
            } else {
              // 右边能量大
              arr.pop();
              arr.push(right);
            }
          }
        }
      }
      if (b) {
        // 发生过碰撞
        return this.asteroidCollision1(arr);
      } else {
        return arr;
      }
    },

    // 常规方法
    asteroidCollision(asteroids) {
      let b = false; // 判断是否发生碰撞
      let arr = [];
      for (let i = 0; i < asteroids.length; i++) {
        const left = asteroids[i];
        const right = asteroids[i + 1];

        if (right == undefined) {
          arr.push(left);
          break;
        }
        const m = left * right;
        if (m > 0) {
          // 同向
          // 不会发生碰撞
          arr.push(left);
        } else {
          // 相向 or 反向
          if (left < 0 && right > 0) {
            // 相反方向
            // 但不会碰撞
            arr.push(left);
          } else {
            b = true;
            // 对向运行 碰撞
            let absL = Math.abs(left);
            let absR = Math.abs(right);
            if (absL > absR) {
              // 左边保留 右边销毁
              arr.push(absL);
              i = i + 1;
            } else if (absL == absR) {
              i += 1;
            }
          }
        }
      }
      if (b) {
        // 发生过碰撞
        return this.asteroidCollision(arr);
      } else {
        return arr;
      }
    },
  },
};
</script>
<style scoped></style>
