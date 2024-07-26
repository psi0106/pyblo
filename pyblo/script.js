function initBlockly() {
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: `
      <xml xmlns="http://www.w3.org/1999/xhtml">
        <!-- 변수 블록 -->
        <block type="variables_set">
          <field name="VAR">item1</field>
          <value name="VALUE">
            <block type="math_number">
              <field name="NUM">0</field>
            </block>
          </value>
        </block>
        <block type="variables_set">
          <field name="VAR">item2</field>
          <value name="VALUE">
            <block type="math_number">
              <field name="NUM">0</field>
            </block>
          </value>
        </block>
        <block type="variables_get">
          <field name="VAR">item1</field>
        </block>
        <block type="variables_get">
          <field name="VAR">item2</field>
        </block>
        <!-- If-Else 문 블록 -->
        <block type="controls_if"></block>
        <!-- 함수 정의 및 호출 블록 -->
        <block type="procedures_defreturn">
          <field name="NAME">my_function</field>
          <statement name="STACK">
            <block type="text_print">
              <value name="TEXT">
                <block type="text">
                  <field name="TEXT">Hello from function!</field>
                </block>
              </value>
            </block>
            <block type="variables_set">
              <field name="VAR">result</field>
              <value name="VALUE">
                <block type="math_number">
                  <field name="NUM">0</field>
                </block>
              </value>
            </block>
          </statement>
          <value name="RETURN">
            <block type="variables_get">
              <field name="VAR">result</field>
            </block>
          </value>
        </block>
        <block type="procedures_callreturn">
          <field name="NAME">my_function</field>
        </block>
        <!-- 논리 연산자 블록 -->
        <block type="logic_compare">
          <field name="OP">EQ</field>
          <value name="A">
            <block type="math_number">
              <field name="NUM">1</field>
            </block>
          </value>
          <value name="B">
            <block type="math_number">
              <field name="NUM">1</field>
            </block>
          </value>
        </block>
        <block type="logic_operation">
          <field name="OP">AND</field>
          <value name="A">
            <block type="logic_boolean">
              <field name="BOOL">TRUE</field>
            </block>
          </value>
          <value name="B">
            <block type="logic_boolean">
              <field name="BOOL">FALSE</field>
            </block>
          </value>
        </block>
        <block type="logic_negate">
          <value name="BOOL">
            <block type="logic_boolean">
              <field name="BOOL">TRUE</field>
            </block>
          </value>
        </block>
        <!-- 반복문 블록 -->
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <block type="math_number">
              <field name="NUM">3</field>
            </block>
          </value>
          <statement name="DO">
            <block type="text_print">
              <value name="TEXT">
                <block type="text">
                  <field name="TEXT">Hello, Blockly!</field>
                </block>
              </value>
            </block>
          </statement>
        </block>
        <!-- 숫자 및 텍스트 블록 -->
        <block type="math_number"></block>
        <block type="text"></block>
      </xml>
    `,
    grid: {
      spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: true
    }
  });

  window.generateCode = function() {
    const code = Blockly.Python.workspaceToCode(workspace);
    document.getElementById('codeOutput').textContent = code;

    // Python 코드 실행 시뮬레이션 및 결과 표시
    const result = simulatePythonExecution(code);
    document.getElementById('resultOutput').textContent = result;
  };

  function simulatePythonExecution(code) {
    const results = [];
    const lines = code.split('\n');
    let repeatBlock = [];
    let repeatCount = 0;
    let insideRepeatBlock = false;
    let insideIfBlock = false;
    let insideElseBlock = false;
    let ifCondition = true;
    let insideFunctionDef = false;
    let insideFunctionCall = false;
    let currentFunctionName = '';
    let functions = {}; // 함수 저장 객체
    let variables = {}; // 변수 저장 객체

    function evalExpression(expression) {
      // 변수 참조를 처리
      Object.keys(variables).forEach(varName => {
        const varValue = variables[varName];
        expression = expression.replace(new RegExp(`\\b${varName}\\b`, 'g'), varValue);
      });
      try {
        // 비교 연산자 처리
        expression = expression
          .replace(/==/g, '===')
          .replace(/!=/g, '!==')
          .replace(/<=/g, '<=')
          .replace(/>=/g, '>=')
          .replace(/</g, '<')
          .replace(/>/g, '>');
        
        return eval(expression);
      } catch (e) {
        return '표현식 평가 오류: ' + e.message;
      }
    }

    function executeFunction(name) {
      if (functions[name]) {
        const functionLines = functions[name];
        let returnValue = null;
        functionLines.forEach(line => {
          line = line.trim();
          if (line.startsWith('print(')) {
            let expression = line.match(/print\(([^)]+)\)/)[1].trim();
            let result = evalExpression(expression);
            results.push(result);
          } else if (line.startsWith('return ')) {
            returnValue = evalExpression(line.slice(7).trim());
          }
        });
        return returnValue;
      }
    }

    for (let line of lines) {
      line = line.trim();

      // 함수 정의 처리
      if (line.startsWith('def ')) {
        insideFunctionDef = true;
        currentFunctionName = line.split(' ')[1].split('(')[0];
        functions[currentFunctionName] = [];
        continue;
      }

      // 함수 정의 끝 처리
      if (insideFunctionDef && line === '') {
        insideFunctionDef = false;
        continue;
      }

      // 함수 정의 블록 내용 처리
      if (insideFunctionDef) {
        functions[currentFunctionName].push(line);
        continue;
      }

      // 사용자 지정 함수 호출 처리
      if (line.startsWith('call ')) {
        const functionName = line.match(/call (\w+)/)[1];
        const returnValue = executeFunction(functionName);
        variables['result'] = returnValue; // 함수의 반환 값을 변수에 할당
        continue;
      }

      // 변수 선언 및 할당 처리
      if (line.includes(' = ')) {
        const [variable, value] = line.split(' = ');
        variables[variable] = evalExpression(value);
        continue;
      }

      // 변수 사용 처리
      if (line.startsWith('print(')) {
        let expression = line.match(/print\(([^)]+)\)/)[1].trim();
        let result = evalExpression(expression);
        results.push(result);
        continue;
      }

      // 반복문 블록의 시작 감지
      if (line.startsWith('for ')) {
        repeatCount = parseInt(line.match(/range\((\d+)\)/)[1], 10);
        insideRepeatBlock = true;
        repeatBlock = [];
        continue;
      }

      // 반복문 블록의 끝 감지 및 처리
      if (insideRepeatBlock && line === '') {
        // 반복문 블록 실행
        for (let i = 0; i < repeatCount; i++) {
          for (let blockLine of repeatBlock) {
            blockLine = blockLine.trim();
            if (blockLine.startsWith('print(')) {
              let expression = blockLine.match(/print\(([^)]+)\)/)[1].trim();
              let result = evalExpression(expression);
              results.push(result);
            }
          }
        }
        insideRepeatBlock = false;
        continue;
      }

      // 반복문 블록 내부의 줄을 저장
      if (insideRepeatBlock) {
        repeatBlock.push(line);
        continue;
      }

      // if 문 블록의 시작 감지
      if (line.startsWith('if ')) {
        insideIfBlock = true;
        insideElseBlock = false;
        try {
          ifCondition = evalExpression(line.slice(3).replace(/and/g, '&&').replace(/or/g, '||').replace(/not/g, '!'));
        } catch (e) {
          ifCondition = false;
        }
        continue;
      }

      // else 문 블록의 시작 감지
      if (line.startsWith('else:')) {
        insideIfBlock = false;
        insideElseBlock = true;
        continue;
      }

      // if 문 블록의 끝 감지 및 처리
      if (insideIfBlock && line === '') {
        insideIfBlock = false;
        continue;
      }

      // else 문 블록의 끝 감지 및 처리
      if (insideElseBlock && line === '') {
        insideElseBlock = false;
        continue;
      }

      // if 문 조건이 참일 때 블록 처리
      if (insideIfBlock && ifCondition) {
        if (line.startsWith('print(')) {
          let expression = line.match(/print\(([^)]+)\)/)[1].trim();
          let result = evalExpression(expression);
          results.push(result);
        }
      }

      // else 문 블록 처리
      if (insideElseBlock) {
        if (line.startsWith('print(')) {
          let expression = line.match(/print\(([^)]+)\)/)[1].trim();
          let result = evalExpression(expression);
          results.push(result);
        }
      }
    }

    return results.join('\n'); // 결과를 줄바꿈으로 연결하여 반환
  }
}

window.onload = initBlockly; // 페이지 로드 시 Blockly 초기화
