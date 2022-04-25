import Decimal from 'decimal.js'

/**
 * 检查金额的格式是否正确
 * @param {any} amount 
 * @returns {boolean} isCorrect
 */
const checkAmount = (amount) => {
    // 检查是否为数字
    if (!isNaN(amount)) {
        // 检查是否不小于0
        if (amount < 0) {
            return false
        }
        // 检查是否有小数点
        if (amount.toString().indexOf('.') > -1) {
            // 检查小数点后是否大于 2 位
            return amount.toString().split('.')[1].length > 2 ? false : true
        }

        // 没有小数点直接返回 true
        return true
    }

    return false
}

const validateCheckAmount = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('请输入金额数字'))
    }

    if (!checkAmount(value)) {
        return callback(new Error('金额数字不符合格式'))
    }

    return callback()
}

export { checkAmount, validateCheckAmount }