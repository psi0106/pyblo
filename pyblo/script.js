function initBlockly() {
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: `
      <xml xmlns="http://www.w3.org/1999/xhtml">
        <block type="controls_if"></block>
        <block type="controls_repeat_ext">
          <value name=" TIMES">
            <block type="math_number">
              <field name="NUM">10</field>
            </block>
          </value>
        </block>
        <block type="math_arithmetic">
          <field name="OP">ADD</field>
          <value name="A">
            <block type="math_number">
              <field name="NUM">1</field>
            </block>
          </value>
          <value name="B">
            <block type="math_number">
              <field name="NUM">2</field>
            </block>
          </value>
        </block>
        <block type="text_print">
          <value name="TEXT">
            <block type="text">
              <field name="TEXT">Hello, Blockly!</field>
            </block>
          </value>
        </block>
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

    // Simulate execution and display result (Note: This is a static simulation)
    // In a real application, you'd send the code to a backend for execution
    const result = simulatePythonExecution(code);
    document.getElementById('resultOutput').textContent = result;
  };

  function simulatePythonExecution(code) {
    // Simulate execution of the Python code (for demo purposes only)
    // This is just a placeholder. Real execution requires server-side processing.
    if (code.includes('print')) {
      return 'Execution result:\nHello, Blockly!';
    }
    return 'No print statements found.';
  }
}

window.onload = initBlockly;
