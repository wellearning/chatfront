export default{
  install (Vue, options) {
    Vue.prototype.isDate = function (dateval) {
      if (dateval.length > 12 && isNaN(dateval) && !isNaN(Date.parse(dateval))) return true
      else return false
    }
    Vue.prototype.getOperands = function (express) {
      // 从表达式中获取所有的操作数（含变量），以数组的方式返回，其目的是为了将变量替换实际的数值
      let re0 = /\)|\(/g
      express = express.replace(re0, '')
      let re = /\+|-|\*|\/|:|\?|<=|>=|==|<|>|&&|\|\|/g
      let list = express.split(re)
      let result = []
      list.forEach(function (item) {
        item = item.trim()
        result.push(item)
      })
      return result
    }
    Vue.prototype.getNPN = function (express) {
      // 将表达式转换为逆波兰式
      express = express.replace(/\s/g, '')
      let re = /\d+\.?\d*|\+|-|\*|\/|\)|\(|:|\?|<=|>=|==|<|>|&&|\|\|/g
      let list0 = express.match(re)
      console.log('original array:' + list0)
      let list1 = []
      let list2 = []
      for (let i = 0; i < list0.length; i++) {
        let op = list0[i]
        if (!isNaN(op)) list1.push(op)
        else if (op === ':') continue
        else if (op === '(') list2.push(op)
        else if (op === ')') {
          let op1 = list2.pop()
          while (op1 !== '(') {
            list1.push(op1)
            op1 = list2.pop()
          }
        } else {
          if (list2.length === 0) list2.push(op)
          else {
            let op2 = list2.pop()
            if (op2 === '(') {
              list2.push(op2)
              list2.push(op)
            } else {
              if (this.compareOperator(op2, op)) {
                list2.push(op2)
                list2.push(op)
              } else {
                while (this.compareOperator(op, op2)) {
                  list1.push(op2)
                  if (list2.length > 0) {
                    op2 = list2.pop()
                    if (op2 === '(') {
                      list2.push(op2)
                      break
                    }
                  } else break
                }
                // list2.push(op2)
                list2.push(op)
              }
            }
          }
        }
        console.log('loop=' + i + ', list1:' + list1 + ', list2:' + list2)
      }
      while (list2.length > 0) {
        let op = list2.pop()
        list1.push(op)
      }
      return list1
    }
    Vue.prototype.evalNPN = function (express) {
      // 计算逆波兰表达式
      let list = this.getNPN(express)
      console.log('npn express:' + list)
      let nums = []
      let symbol = []
      for (let i = 0; i < list.length; i++) {
        let node = list[i]
        if (!isNaN(node)) {
          nums.push(Number(node))
        } else {
          if (nums.length >= 2) {
            let b = nums.pop()
            let a = nums.pop()
            let sym = list[i]
            if (sym === '+') nums.push(a + b)
            else if (sym === '-') nums.push(a - b)
            else if (sym === '*') nums.push(a * b)
            else if (sym === '/') nums.push(a / b)
            else if (sym === '==') nums.push(a === b)
            else if (sym === '>') nums.push(a > b)
            else if (sym === '<') nums.push(a < b)
            else if (sym === '>=') nums.push(a >= b)
            else if (sym === '<=') nums.push(a <= b)
            else if (sym === '!=') nums.push(a !== b)
            else if (sym === '&&') nums.push(a && b)
            else if (sym === '||') nums.push(a || b)
            else if (sym === '?') {
              let c = nums.pop()
              if (c) nums.push(a)
              else nums.push(b)
            }
          } else {
            symbol.push(node)
          }
        }
      }
      return nums[0]
    }
    Vue.prototype.compareOperator = function (oper1, oper2) {
      // 比较两个操作符的优先顺序
      let operators = '?:&&||==><<=>=!=+-*/'
      let l1 = operators.indexOf(oper1)
      let l2 = operators.indexOf(oper2)
      if (l1 <= l2) return true
      else return false
    }
    Vue.prototype.retrieveInterval = function (express) {
      let interval = {}
      interval.startInclude = express.startsWith('[')
      interval.endInclude = express.endsWith(']')
      let express1 = express.replace(/\[|\]|\(|\)/g, '')
      let operands = express1.split(',')
      if (operands.length !== 2) {
        interval.start = Number.MIN_VALUE
        interval.end = Number.MAX_VALUE
      } else {
        if (isNaN(operands[0])) interval.start = Number.MIN_VALUE
        else interval.start = Number(operands[0])
        if (isNaN(operands[1])) interval.end = Number.MAX_VALUE
        else interval.end = Number(operands[1])
      }
      return interval
    }
    Vue.prototype.compareInterval = function (interval, value) {
      if (value < interval.end && value > interval.start) return true
      if (interval.startInclude && value === interval.start) return true
      if (interval.endInclude && value === interval.end) return true
      return false
    }
  }
}
