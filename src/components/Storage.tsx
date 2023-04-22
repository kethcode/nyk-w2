import { useState, useMemo } from "react";
import { ethers } from "ethers";

export function Storage(props: any) {
  let storage_array: any[];

  const getHexSlotString = (index: number) => {
    return (
      ethers.utils.hexlify(index * 32) +
      ":" +
      ethers.utils.hexlify((index + 1) * 32 - 1)
    );
  };

  const renderResults = () => {
    return (
      <div>
        <h3>storage</h3>
        <div className="container-terminal">
          <ul>{storage_array}</ul>
        </div>
      </div>
    );
  };

  const updateStorage = async () => {
    if (!props.storageData || !props.storageKey) return;
    // console.log("storageData:", props.storageData);
    // console.log("storageKey:", props.storageKey);

    let storage_size;
    let storage_map: any[] = [];

    if (props.storageData && props.storageKey) {
      storage_size = props.storageKey.length;
      for (let i = 0; i < storage_size; i++) {
        storage_map.push({ key: props.storageKey, data: props.storageData });
      }
      storage_array = storage_map.map((slot, index) => (
        <li key={index}>
          {" "}
          <span className="chisel-yellow">[{slot.key}]</span>:<br />{" "}
          <span className="chisel-cyan"> {slot.data}</span>
        </li>
      ));
    }
  };

  const result = useMemo(
    () => updateStorage(),
    [props.storageData, props.storageKey]
  );

  return <>{renderResults()}</>;
}
