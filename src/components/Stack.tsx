import { useState, useMemo } from "react";
import { ethers } from "ethers";

// type vEVMState = {
//   code: string;
//   data: string;
//   value: string;
//   pc: string;
//   stack: string[];
//   mem: string;
//   storageKey: string[];
//   storageData: string[];
//   logs: string[];
//   output: string;
// };

export function Stack(props: any) {
  const [stack, setStack] = useState<string[]>();

  const renderResults = () => {
    let stack_array;
    if (stack) {
      stack_array = stack.map((stack_slot, index) => (
        <li key={index}>
          {" "}
          <span className="chisel-yellow">[{ethers.utils.hexlify(index)}]</span>
          : <span className="chisel-cyan">{stack_slot.slice(2)}</span>
        </li>
      ));
    }

    return (
      <div>
        <h3>stack</h3>
        <div className="container-terminal">
          <ul>{stack_array}</ul>
        </div>
      </div>
    );
  };

  const updateStack = async () => {
    if (!props.stack) return;
    // console.log("stack:", props.stack);
    if (props.stack != "") {
      setStack(props.stack);
    } else {
      setStack([]);
    }
  };

  const result = useMemo(() => updateStack(), [props.stack]);

  return <>{renderResults()}</>;
}
