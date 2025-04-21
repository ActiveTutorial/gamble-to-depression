<template>
  <div class="container">
    <div v-if="!isMobile()" class="controls-container">
      <p>Controls:</p>
      <p>Spacebar: Spin</p>
      <p>Up/Down: Adjust Risk</p>
      <p>K: Add 500 coins</p>
      <p>C: Clear Balance History</p>
    </div>
    <h1>Get money fast</h1>
    <BalanceChart :balanceHistory="balanceHistory" :netChange="netChange" />
    <!-- Mobile-only Spin button -->
    <button v-if="isMobile()" class="spin-button" @click="spin">Spin!</button>
    <div 
      id="balance" 
      class="balance" 
      @click="isMobile() && addCoins(500)"
    >
      Balance: {{ balance }}
      <button class="plus-button" @click="showPopup = true">+</button>
    </div>
    <!-- Popup -->
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <button class="close-button" @click="showPopup = false">x</button>
        <CryptoPayment />
      </div>
    </div>
    <div id="risk" class="risk">
      Risk: {{ risk }}
      <!-- Mobile-only risk adjustment buttons -->
      <button v-if="isMobile()" class="risk-button" @click="adjustRisk(-50)">-</button>
      <button v-if="isMobile()" class="risk-button" @click="adjustRisk(50)">+</button>
    </div>
    <!-- Mobile-only risk adjustment button -->
    <button v-if="isMobile()" class="clear-history-button subtle-button" @click="clearBalanceHistory">
      Clear History
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BalanceChart from "./BalanceChart.vue"; // Import the new component
import CryptoPayment from "./CryptoPayment.vue"; // Import the new component

export default defineComponent({
  name: "SlotMachineSimulator",
  components: {
    BalanceChart, // Register the new component
    CryptoPayment, // Register the component
  },
  data() {
    return {
      balance: 0 as number, // Initial balance
      risk: 50 as number, // Initial risk
      balanceHistory: [] as number[],
      showPopup: false, // Controls the visibility of the popup
      netChange: 0 as number, // Track the net change for the chart
    };
  },
  async mounted() {
    (window as any).vue_context = this; // Expose Vue instance to the global scope for debugging
    // Create session and fetch balance on mount
    await this.establishSession();
    this.balance = await this.getBalance();

    // Retrieve balance history from local storage
    const storedHistory = localStorage.getItem("balanceHistory");
    this.balanceHistory = storedHistory ? JSON.parse(storedHistory) : [this.balance];

    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    isMobile(): boolean {
      return (navigator as any)?.userAgentData?.mobile;
    },
    async establishSession() {
      try {
        await $fetch("/api/session", {
          method: "POST",
        });
      } catch (error) {
        console.error("Error creating session:", error);
      }
    },
    async getBalance() {
      try {
        const response = await $fetch<{ balance: number }>("/api/balance", {
          method: "GET",
        });
        return response.balance;
      } catch (error) {
        console.error("Error fetching balance:", error);
        return 0; // Default to 0 in case of error
      }
    },
    async setBalance(newBalance: number) {
      try {
        await $fetch("/api/balance", {
          method: "PUT",
          body: { balance: newBalance },
        });
      } catch (error) {
        console.error("Error setting balance:", error);
      }
    },
    async spin() {
      try {
        const response = await $fetch<{ newBalance: number; netChange: number }>("/api/spin", {
          method: "POST",
          body: { risk: this.risk },
        });

        const { newBalance, netChange } = response;

        this.balance = newBalance;
        this.balanceHistory.push(this.balance);
        localStorage.setItem("balanceHistory", JSON.stringify(this.balanceHistory)); // Save to local storage
        this.netChange = netChange; // Update net change
      } catch (error) {
        console.error("Error during spin:", error);
      }
    },
    handleKeydown(event: KeyboardEvent) {
      switch (event.key) {
        case " ": // Spacebar spin
          event.preventDefault();
          this.spin();
          break;
        case "k": // Add coins
          this.addCoins(500);
          break;
        case "ArrowUp": // Increase risk
          event.preventDefault();
          this.adjustRisk(50);
          break;
        case "ArrowDown": // Decrease risk
          event.preventDefault();
          this.adjustRisk(-50);
          break;
        case "c": // Clear balance history
          this.clearBalanceHistory();
          break;
      }
    },
    addCoins(amount: number) {
      // Add coins to balance and update chart
      this.balance += amount;
      this.balanceHistory.push(this.balance);
      localStorage.setItem("balanceHistory", JSON.stringify(this.balanceHistory)); // Save to local storage
      this.setBalance(this.balance); // Update balance on the server
    },
    adjustRisk(amount: number) {
      // Minimum of 10 and maximum of balance
      this.risk = Math.max(
        10,
        Math.min(this.balance, this.risk + amount)
      );
    },
    clearBalanceHistory() {
      this.balanceHistory = [];
      localStorage.removeItem("balanceHistory"); // Clear from local storage
      console.log("Balance history cleared");
    },
  },
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #252525;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.chart {
  width: 90%;
  height: 60vh;
  background-color: #333;
  border-radius: 8px;
  margin-bottom: 20px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #eee;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.balance,
.risk {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #ddd;
}

/* Styles for the mobile-only Spin button */
.spin-button {
  touch-action: manipulation; /* Prevent double-tap zoom on mobile */
  width: 80%;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
}

.spin-button:active {
  background-color: #218838;
}

/* Styles for the mobile-only risk adjustment buttons */
.risk-button {
  margin: 0 5px;
  padding: 10px;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  touch-action: manipulation; /* Prevent double-tap zoom on mobile */
}

.risk-button:active {
  background-color: #0056b3;
}

.plus-button {
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 5px;
  padding: 2px 6px;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup {
  background-color: #333;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #fff;
  position: relative;
  width: 80%;
  max-width: 400px;
  max-height: 80vh; /* Fixed size */
  overflow-y: auto; /* Make it scrollable */
}

/* Dark theme scrollbar */
.popup::-webkit-scrollbar {
  width: 8px;
}

.popup::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 4px;
}

.popup::-webkit-scrollbar-thumb:hover {
  background-color: #777;
}

.popup::-webkit-scrollbar-track {
  background-color: #222;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-button:hover {
  color: #ccc;
}

/* Styles for the mobile-only Clear History button */
.clear-history-button {
  touch-action: manipulation; /* Prevent double-tap zoom on mobile */
  width: 80%;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  background-color: #dc3545;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
}

.clear-history-button:active {
  background-color: #c82333;
}

/* Subtle style for the mobile-only Clear History button */
.subtle-button {
  touch-action: manipulation; /* Prevent double-tap zoom on mobile */
  width: auto;
  padding: 5px 10px;
  margin-top: 10px;
  font-size: 0.9rem;
  font-weight: normal;
  color: #bbb;
  background-color: transparent;
  border: 1px solid #bbb;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

.subtle-button:active {
  color: #fff;
  background-color: #444;
  border-color: #444;
}
</style>
