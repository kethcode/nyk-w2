import { useState, useMemo } from "react";
import { ethers } from "ethers";

export function Memory(props: any) {
  const [memory, setMemory] = useState<string>();

  const getHexSlotString = (index: number) => {
    return (
      ethers.utils.hexlify(index * 32) +
      ":" +
      ethers.utils.hexlify((index + 1) * 32 - 1)
    );
  };

  const renderResults = () => {
    let mem_array;
    let stack_array;
    if (memory) {
      const mem_temp = memory.slice(2).match(/.{1,64}/g) || [];
      mem_array = mem_temp.map((mem_slot, index) => (
        <li key={index}>
          {" "}
          <span className="chisel-yellow">
            [{getHexSlotString(index)}]
          </span>: <span className="chisel-cyan">{mem_slot}</span>
        </li>
      ));
    }

    return (
      <div>
        <h3>memory</h3>
        <div className="container-terminal">
          <ul>{mem_array}</ul>
        </div>
      </div>
    );
  };

  const updateMemory = async () => {
    if (!props.memory) return;
    // console.log("memory:", props.memory);
    if (props.memory != "") {
      setMemory(props.memory);
    } else {
      setMemory("");
    }
  };

  const result = useMemo(() => updateMemory(), [props.memory]);

  return <>{renderResults()}</>;
}
