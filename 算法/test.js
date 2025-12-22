// function isValid(str){
//     const map = {
//         '(': ')',
//         '{': '}',
//         '[': ']',
//     }
//     const stack = []
//     for (let char of str) {
//          console.log(stack, '11111')
//         // 如果是左括号，压入栈
//         if (map[char]) {
//             stack.push(char);
//         } else {
//             // 如果是右括号，检查栈顶是否有对应的左括号
//             const top = stack.pop();
//             if (map[top] !== char) {
//                 return false;
//             }
//         }
//     }
//     return stack.length === 0;
// }
// isValid('())')

function ListNode(val, next) {
     this.val = (val===undefined ? 0 : val)
     this.next = (next===undefined ? null : next)
}
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    // 虚拟头节点：简化结果链表的拼接（无需单独处理头节点）
    const dummyHead = new ListNode(0);
    let current = dummyHead; // 用于构建结果链表的指针
    let carry = 0; // 进位标志，初始为0

    // 遍历两个链表，直到都遍历完且无进位
    while (l1 || l2 || carry) {
        // 若链表已遍历完，当前位值取0
        const val1 = l1 ? l1.val : 0;
        const val2 = l2 ? l2.val : 0;

        // 计算当前位总和（包含上一轮进位）
        const sum = val1 + val2 + carry;
        // 更新进位（总和的十位以上部分）
        carry = Math.floor(sum / 10);
        // 当前位结果（总和的个位部分）
        const currentVal = sum % 10;
        console.log(val1, val2, carry, 'ccccccc');
        
        // 新建节点接入结果链表
        current.next = new ListNode(currentVal);
        current = current.next; // 移动结果链表指针

        // 移动输入链表指针（未遍历完则继续）
        if (l1) l1 = l1.next;
        if (l2) l2 = l2.next;
    }

    // 虚拟头节点的下一个节点即为结果的头节点
    return dummyHead.next;
};

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
 
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var deleteDuplicates = function(head) {
    // 边界条件：空链表直接返回
    if (!head) return null;
    
    let current = head;
    // 遍历链表（直到当前节点的下一个节点为空）
    while (current.next) {
        if (current.val === current.next.val) {
            // 跳过重复节点（修改指针指向）
            current.next = current.next.next;
        } else {
            // 不重复则移动指针
            current = current.next;
        }
    }
    // 返回去重后的链表头部
    return head;
};


const head = new ListNode(1, new ListNode(1, new ListNode(2)));
// deleteDuplicates(head)
