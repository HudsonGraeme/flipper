import { BigNumber, ethers } from "ethers";
import { formatDistance, formatDistanceToNow } from "date-fns";

import { get } from "lodash";
import ky from "ky";

let lastUrl = location.href;
let wasSellVisible = false;
let isInitialized = false;

const provider = new ethers.providers.WebSocketProvider(
  "wss://mainnet.infura.io/ws/v3/ccb7057664bc46978d3e8cd81818894d"
);

/**
 * Gets the last sale amount for this token from rarible and adds on any gas fees paid
 * @returns Details pertaining to the most recent sale of this token
 */
const getLastSale = async () => {
  const splitWindowURL = window.location.href.split("/");
  const contractIndex = splitWindowURL.findIndex((param) =>
    param.startsWith("0x")
  );
  const contractAddress = splitWindowURL[contractIndex];
  const tokenId = splitWindowURL[contractIndex + 1];

  const rariURL = new URL("activities/byItem", "https://api.rarible.org/v0.1/");

  const query = {
    type: "SELL",
    itemId: ["ETHEREUM", contractAddress, tokenId].join(":"),
    sort: "LATEST_FIRST",
    size: 1,
  };
  rariURL.search = new URLSearchParams(query);
  const response = await ky
    .get(rariURL)
    .json()
    .catch((err) => console.error("Unable to fetch previous sale", err));
  if (get(response, "activities.length") === 0) {
    console.error("Flipper: No previous sale found");
    return;
  }
  const [previousSale] = response.activities;
  const previousSaleValue = previousSale.payment.value;
  if (previousSale.type && previousSale.type === "ACCEPT_BID") {
    // The seller accepted an offer, which means the seller paid the gas in this case and we don't need to consider those fees.
    console.log("Seller accepted offer for:", previousSaleValue);
    return {
      totalSpend: ethers.utils.parseEther(previousSaleValue),
      ...previousSale,
    };
  }
  const txReceipt = await provider.getTransactionReceipt(
    previousSale.transactionHash
  );
  const gasSpendWei = txReceipt.effectiveGasPrice.mul(txReceipt.gasUsed);
  console.log("ETH gas spend", ethers.utils.formatEther(gasSpendWei));
  const totalSpend = ethers.utils
    .parseEther(previousSaleValue)
    .add(gasSpendWei);
  console.log("Buyer paid:", ethers.utils.formatEther(totalSpend));
  return {
    totalSpend,
    ...previousSale,
  };
};

/**
 * Scrapes creator and service fees from the OS frontend
 * @returns {object} The collection fees for this token
 */
const getCollectionFees = () => {
  const serviceFeeElement = document
    .evaluate(
      '//div[text()="Service Fee"]',
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    )
    .iterateNext();
  const serviceFeePercentage =
    +serviceFeeElement.nextSibling.innerText.replace("%", "") / 100;

  const creatorFeeElement = document
    .evaluate(
      '//div[text()="Creator Fee"]',
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    )
    .iterateNext();
  const creatorFeePercentage =
    +creatorFeeElement.nextSibling.innerText.replace("%", "") / 100;

  const totalFeePercentage = serviceFeePercentage + creatorFeePercentage;
  return {
    serviceFeePercentage,
    creatorFeePercentage,
    totalFeePercentage,
  };
};

/**
 *
 * @param {number} lastSaleDec The cost of the last sale in decimal form
 * @param {number} percentageGain The percentage that the user wants to gain by selling this NFT
 */
const calculateNewPrice = async (lastSaleDec, percentageGain) => {
  return (
    lastSaleDec / (1 - getCollectionFees().totalFeePercentage - percentageGain)
  );
};

/**
 * Renders flipper controls on the OS UI
 * @param percentages An object containing values as numeric decimal percentages and keys as labels for the buttons
 */
const renderUIElements = (error = false, purchaseDetails = null) => {
  const percentages = { "10%": 0.1, "25%": 0.25, "50%": 0.5 };
  const priceLabel = document.querySelector('label[for="price"] div');
  const priceInput = document.querySelector('input[name="price"]');
  const priceDiv = priceInput.parentElement.parentElement.parentElement;
  const gainDiv = document.createElement("div");
  const numFmt = Intl.NumberFormat("en-US", {
    signDisplay: "exceptZero",
  });
  if (document.querySelector(".flipper-container")) return;
  const container = document.createElement("div");
  container.classList.add("flipper-container");

  if (error) {
    container.classList.add("flipper-container-error");
    const errorIcon = document.createElement("svg");
    errorIcon.classList.add("flipper-error-icon");
    errorIcon.innerHTML =
      '<svg width="1.5rem" height="1.5rem" viewBox="0 0 752 752" xmlns="http://www.w3.org/2000/svg"><path d="M376 162.89c-117.92 0-213.11 95.188-213.11 213.11S258.081 589.11 376 589.11 589.11 493.919 589.11 376c-.003907-117.92-95.195-213.11-213.12-213.11zm-.94531 327.72c-12.785 0-23.207-10.418-23.207-23.207 0-12.785 10.418-23.207 23.207-23.207 12.785 0 23.207 10.418 23.207 23.207-.003907 12.785-10.422 23.207-23.207 23.207zm24.625-85.246c0 12.785-10.891 23.207-23.68 23.207-12.785 0-23.68-10.418-23.68-23.207l.003907-121.24c0-12.785 10.891-23.207 23.68-23.207 12.785 0 23.68 10.418 23.68 23.207z"/></svg>';
    container.appendChild(errorIcon);
    const errorMessage = document.createElement("p");
    errorMessage.innerText =
      "Flipper encountered an error. Please try again later.";
    errorMessage.classList.add("flipper-error-message");
    container.appendChild(errorMessage);
  } else {
    const costDiv = document.createElement("div");
    const costText = document.createElement("p");
    const txLink = document.createElement("a");
    costDiv.classList.add("flipper-cost");
    costText.classList.add("flipper-cost-text");
    costText.innerText = [
      "You paid",
      purchaseDetails.totalSpend,
      formatDistanceToNow(new Date(purchaseDetails.date), { addSuffix: true }),
      "in transaction",
    ].join(" ");
    costDiv.appendChild(costText);
    txLink.href = "https://etherscan.io/tx/" + purchaseDetails.transactionHash;
    txLink.target = "_blank";
    txLink.relList.add("noopener", "noreferrer");
    txLink.classList.add("SellForm--more-options", "flipper-tx-link");
    txLink.innerText =
      purchaseDetails.transactionHash.slice(0, 4) +
      "..." +
      purchaseDetails.transactionHash.slice(
        purchaseDetails.transactionHash.length - 4
      );
    costDiv.appendChild(txLink);
    priceDiv.appendChild(costDiv);

    Object.entries(percentages).forEach(([label, percentage]) => {
      const percentageButton = document.createElement("button");
      percentageButton.textContent = label;
      percentageButton.classList.add(
        "SellForm--more-options",
        "flipper-percentage-button"
      );
      percentageButton.type = "button";
      percentageButton.addEventListener("click", async () => {
        priceInput.focus();
        const newPrice = await calculateNewPrice(
          purchaseDetails.totalSpend,
          percentage
        );
        priceInput.value = `${newPrice}`;
        const ethGained =
          newPrice -
          +purchaseDetails.totalSpend -
          newPrice * getCollectionFees().totalFeePercentage;
        gainDiv.innerText = `(${numFmt.format(ethGained)}Ξ)`;
        priceInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      container.appendChild(percentageButton);
    });
    container.appendChild(gainDiv);
  }
  priceInput.addEventListener("input", (e) => {
    const ethGained =
      +e.target.value -
      +purchaseDetails.totalSpend -
      +e.target.value * getCollectionFees().totalFeePercentage;
    if (isFinite(+e.target.value)) {
      gainDiv.innerText = `(${numFmt.format(ethGained)}Ξ)`;
    }
  });

  priceLabel.insertBefore(container, priceLabel.children[0]);
};

/**
 * Main function to initialize flipper when the user is on the right page.
 */
const init = async () => {
  // Prevent duplicate UIs
  let fatalError = false;
  let ethSpentOnPurchase = null;
  try {
    const purchaseDetails = await getLastSale();
    ethSpentOnPurchase = ethers.utils.formatEther(purchaseDetails.totalSpend);
    isInitialized = true;
    renderUIElements(fatalError, {
      ...purchaseDetails,
      totalSpend: ethSpentOnPurchase,
    });
  } catch (e) {
    fatalError = true;
    console.error("Flipper: FATAL - Unable to fetch last sale price");
    throw e;
  }
};

// If the user starts on the right page, initialize flipper
if (window.location.href.includes("sell")) init();

const onUrlChange = (newUrl) => {
  if (
    newUrl.includes("sell") &&
    document.querySelector('label[for="price"] div') &&
    !isInitialized
  )
    // If flipper hasn't yet run and a react router push to sell has occurred, initialize flipper
    init();
};

new MutationObserver(() => {
  const url = location.href;
  const sellVisible = !!document.querySelector('label[for="price"] div');
  if (url !== lastUrl) isInitialized = false;
  if (url !== lastUrl || sellVisible !== wasSellVisible) {
    lastUrl = url;
    wasSellVisible = sellVisible;
    onUrlChange(url);
  }
}).observe(document, { subtree: true, childList: true });
