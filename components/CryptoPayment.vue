<template>
  <div class="crypto-payment">
    <h2>Add Balance</h2>
    <p>Pay with cryptocurrency to add coins to your balance.</p>
    <form @submit.prevent="processPayment">
      <label for="crypto-address">Crypto Address:</label>
      <input id="crypto-address" v-model="cryptoAddress" type="text" placeholder="Enter your crypto address" />
      
      <label for="amount">Amount:</label>
      <input id="amount" v-model.number="amount" type="number" placeholder="Enter amount" />

      <button type="submit">Pay</button>
    </form>
    <div v-if="qrCodeData" class="qr-code">
      <p class="warning">
        ⚠️ Please ensure the payment is exact and from the correct wallet address.<br />
        Underpayments or payments from different wallets <strong>will not be credited</strong>.
      </p>
      <h3>Scan to Pay</h3>
      <img :src="qrCodeData" alt="QR Code" />
      <p>Or pay here:</p>
      <div class="wallet-address">
        <code>
          {{ paymentAddress }}
          <button @click="copyToClipboard" class="copy-icon" aria-label="Copy to clipboard">
            {{ isCopied ? "✔️" : "📋" }}
          </button>
        </code>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import QRCode from "qrcode";

export default defineComponent({
  name: "CryptoPayment",
  data() {
    return {
      cryptoAddress: "",
      amount: 0,
      qrCodeData: "",
      paymentAddress: "nano_3dfgkusfwccqnyyx1ufmrzz3y5izfqz3c7hmqueqsgf8y4kh15bg63uhiqz", // Wallet address
      isCopied: false, // Reactive property for clipboard icon
    };
  },
  methods: {
    async processPayment() {
      if (!this.cryptoAddress || this.amount <= 0) {
        alert("Please enter a valid crypto address and amount.");
        return;
      }
      const paymentData = `nano:${this.paymentAddress}?amount=${this.amount}`;
      try {
        this.qrCodeData = await QRCode.toDataURL(paymentData);
      } catch (error) {
        alert("Failed to generate QR code. Please try again.");
        console.error(error);
      }
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.paymentAddress).then(() => {
        this.isCopied = true; // Set to true to show checkmark
        setTimeout(() => {
          this.isCopied = false; // Revert back after 2 seconds
        }, 2000);
      }).catch(() => {
        alert("Failed to copy wallet address.");
      });
    },
  },
});
</script>

<style scoped>
.crypto-payment {
  text-align: center;
  color: #fff;
}

.crypto-payment h2 {
  margin-bottom: 10px;
}

.crypto-payment form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.crypto-payment label {
  margin-top: 10px;
  font-size: 1rem;
}

.crypto-payment input {
  margin-top: 5px;
  padding: 8px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 80%;
}

.crypto-payment button {
  margin-top: 15px;
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.crypto-payment button:hover {
  background-color: #218838;
}

.qr-code {
  margin-top: 20px;
  text-align: center;
}

.qr-code img {
  max-width: 200px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.wallet-address {
  display: flex;
  align-items: center; /* Vertically align items */
  gap: 10px;
  flex-wrap: wrap; /* Allow wrapping to prevent stretching */
  word-break: break-word; /* Ensure long words break properly */
}

.wallet-address code {
  display: inline-flex;
  align-items: center; /* Vertically align the copy button */
  background-color: #2f3136; /* Discord-like background */
  color: #fff; /* Text color */
  padding: 4px 8px;
  border-radius: 5px;
  border: 1px solid #202225; /* Discord-like border */
  font-family: monospace;
  font-size: 0.95rem;
  word-break: break-all; /* Break long strings inside the code block */
}

.copy-icon {
  margin-left: 8px;
  background: none;
  border: none;
  color: #b9bbbe; /* Grey color to match the code block style */
  font-size: 1rem;
  cursor: pointer;
  padding: 0; /* Remove padding to fit seamlessly */
}

.copy-icon:hover {
  color: #fff; /* Highlight color on hover */
}

.warning {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #634646;
  color: #ff1e00;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  font-size: 0.95rem;
  text-align: center;
}
</style>
