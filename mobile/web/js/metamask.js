window.connectMetaMask = async function () {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      return accounts[0];
    } catch (err) {
      return null;
    }
  } else {
    return null;
  }
};

window.isMetaMaskAvailable = function () {
  return typeof window.ethereum !== "undefined";
};
