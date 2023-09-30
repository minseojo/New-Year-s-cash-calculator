const MIN_INFINITY = 0; // 연산 결과 최소 값 상수
const MAX_INFINITY = 9999999999; // 연산 결과 최대 값 상수 (10자리)
const OP = 0; // state 연산자 상수
const DECIMAL_POINT = 1; // state 소수점 상수
const EQUAL_SIGN = 2; // state 등호 상수
let state = [false, false, false]; // 연산자, 소수점, 등호(=) 상태
// 연산자 (계속 바뀌면 마지막 연산자만 선택), 
// 소수점 여부 (소수점은 한 수식당 최대 1개)
// 등호 여부(1 + 3 = 상태에서 '='을 계속 누르면 무시해야함)

const defaultValue = '0'; // 초기 기본 값
let currentInput = defaultValue; // 입력 값 (초기 기본값으로 초기화)
let out = []; // 입력 수식 ex) 1 + 3 * 4 = (= 생략), 매 순간 더해짐

function getOperatorPriority(op) {
    // 리턴 값이 작을 수록 우선순위가 높음
    if (op === '×' || op === '÷') return 1;
    else if (op === '+' || op === '-') return 2;
    return 1000; // 연산자가 아닌 경우
}

// 숫자, 연산자, 소수점 버튼
function appendToDisplay(value) {
    state[EQUAL_SIGN] = false;
    console.log("input = " + value)
    // 소수점
    if (value == '.' && !state[DECIMAL_POINT]) {
        state[DECIMAL_POINT] = true;
        currentInput += value;
    }
    // 숫자
    else if ('0' <= value && value <= '9') {
        // 소수점 포함 11 자리까지 가능
        if (state[DECIMAL_POINT] && currentInput.length > 10) return;
        // 소수점 제외 10 자리까지 가능
        if (!state[DECIMAL_POINT] && currentInput.length > 9) return;
        // 이전 입력이 문자였으면, 'op1 + (op2, 입력 대기)' 인 currentInput = op1인 상태에서 
        // currentInput을 0으로 초기화 하고, op2를 입력 받을 준비. 
        // + 디스플레이에 새로운 값 보여줌
        if (state[OP] === true) {
            currentInput = defaultValue;
            document.getElementById('display').value = value;
            state[OP] = false;
        }
        // 기본 값 0 무시하기 - ex) '12' 입력하면 '012'가 아닌 '12'로 보여짐
        if (currentInput === defaultValue) currentInput = value;
        else currentInput += value;
    }
    // 연산자
    else if ((value === '+' || value === '-') || 
        (value === '×' || value === '÷')) {
        // 수식이 없는 경우
        if (currentInput.length == 0) return;
        // 연산자를 바꾸는 경우
        if (state[OP]) {
            // 이전 연산자 제거
            out.pop();
        }
        // 연산자를 처음 입력한 경우 
        else {
            // 새로운 숫자를 받으므로 소수점 여부 기본값으로 초기화
            state[DECIMAL_POINT] = false;
            // 연산자 선택 
            state[OP] = true;
            // 이전 숫자 추가
            out.push(currentInput);
        }
        // 연산자 추가
        out.push(value);
        // 디스플레이에 보여지는 값
        currentInput = value;
    }
    console.log("[out] 현재 수식: " + out);
    // 디스플레이에 보여주기
    document.getElementById('display').value = currentInput;
    // 현재 디스플레이에 입력값이 있는 경우 delete_btn = [C]
    if (currentInput.length > 0) document.getElementById('delete_btn').innerText = 'C';
    // 현재 디스플레이에 입력값이 없는 경우 delete_btn = [AC]
    else document.getElementById('delete_btn').innerText = 'AC';
}

// 'C', 'AC' 버튼
function clearDisplay() {
    // (C) 이전 값만 지우기
    currentInput = defaultValue; // 입력 값 기본 값(0)으로 초기화
    document.getElementById('display').value = defaultValue;
    if (document.getElementById('delete_btn').innerText === 'C') {
        if ('0' <= out[out.length-1] && out[out.length-1] <= '9999999999')
        out.pop();
        console.log("out: " + out);
        document.getElementById('delete_btn').innerText = 'AC';
    }

    // C 기능 + (AC) 전체 초기화
    else if (document.getElementById('delete_btn').innerText === 'AC') {
        state = [false, false, false];
        out = [];
    }
}

// '=' 버튼 
function calculateResult() {
    // (제약 사항: 더하기, 곱하기, 나누기 다음 숫자를 입력하지 않고 ‘=’ 를 입력할 경우 alert을 띄워줍니다.)
    // 잘못된 수식 Ex) 1 + 2 + = 
    if (currentInput === '+' || currentInput === '-' ||
        currentInput === '×' || currentInput === '÷') {
        alert('더하기, 빼기, 곱하기, 나누기 다음 숫자를 입력하세요.');
        return;
    }

    // 이미 연산이 끝난 상황에서 '=' 버튼을 계속 누르는 경우 무시
    if (state[EQUAL_SIGN]) return;
    state[EQUAL_SIGN] = true;

    // 수식이 없는 경우 (무시) ex - '='버튼만 누르는 상황
    if (out.length == 0) return;

    // '=' 버튼을 누르면 이전 입력값을 추가해줌.
    // ex) 1 + 2 * 3 = , 3을 out에 추가, out = [1,+,2,*,3]
    if (MIN_INFINITY <= currentInput && currentInput <= MAX_INFINITY) {
        out.push(currentInput);
    }
    console.log("[out] 최종 수식: " + out);

    // 입력 값을 후위표기식으로 변환
    let postfix = convertPostfix();
    console.log("[postfix] 최종 수식 후위표기식으로 변환: " + postfix);
    // 후위표기식 계산
    let resultStack = [];
    for (let token of postfix) {
        if (MIN_INFINITY <= token && token <= MAX_INFINITY) {
            resultStack.push(parseFloat(token));
        } else {
            let operand2 = resultStack.pop();
            let operand1 = resultStack.pop();
            switch (token) {
                case '+':
                    resultStack.push(operand1 + operand2);
                    break;
                case '-':
                    resultStack.push(operand1 - operand2);
                    break;
                case '×':
                    resultStack.push(operand1 * operand2);
                    break;
                case '÷':
                    // 나눗셈 오류
                    if (operand2 === 0) {
                        document.getElementById('display').value = '숫자 아님';
                        return;
                    }
                    resultStack.push(operand1 / operand2);
                    break;
            }
        }
    }
    
    if (resultStack.length === 1) {
        console.log("[resultStack[0]] 계산 결과 = " + resultStack[0]);
        // 결과 값이 10자리 넘어가는 경우 'Infinity'
        if (resultStack[0] > MAX_INFINITY) {
            document.getElementById('display').value = 'Infinity';
        }
        // 정상 계산인 경우
        else {
            // 제약 사항: 연산 결과는 소수점 이하를 버림하여 정수로 표시합니다.
            resultStack[0] = Math.floor(resultStack[0]);
            // 3자리 마다 ',' 컴마 찍어서 디스플레이에 보여 주기
            document.getElementById('display').value = resultStack[0].toLocaleString('ko-KR');
            currentInput = resultStack[0].toString();
            state = [false, false, false];
            out = [];
        }
    }
}

// 후위표기식 변환 함수
function convertPostfix() {
    let stack = [];
    let result = [];
    for (let c of out) {
		if (MIN_INFINITY <= c && c <= MAX_INFINITY) {
			result.push(c);
		}
		else { // 연산자인 경우
            // 스택에 있는 연산자 우선순위가 현재 연산자 우선순위보다 높은경우, 스택에 있는 연산자 출력
            while(stack.length != 0 && getOperatorPriority(stack[stack.length-1]) <= getOperatorPriority(c)) {
                result.push(stack.pop());
            }
            stack.push(c); // 현재 연산자 스택에 넣기
        }
	}
    // 남은 연산자 출력
	while (stack.length > 0) {
		result.push(stack.pop());
	}
    return result;
}