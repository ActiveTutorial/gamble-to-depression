<template>
  <div id="app">
    <SlotMachineSimulator />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SlotMachineSimulator from "./components/SlotMachineSimulator.vue";

export default defineComponent({
  name: "IndexPage",
  components: {
    SlotMachineSimulator,
  },
});
</script>

<style>
  body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #1a1a1a;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 0; /* Remove padding for full-screen fit */
      box-sizing: border-box;
      height: 100vh;
      overflow: hidden;
  }
  
  .container {
      width: 100%; /* Stretch to full width */
      height: 100%; /* Stretch to full height */
      padding: 20px;
      background-color: #252525;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
  }
  
  h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #eee;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  .balance {
      font-size: 1.2rem;
      margin-bottom: 20px;
      color: #ddd;
  }
  
  .spin-button {
      background-color: #4CAF50;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      margin-top: auto; /* Push the button to the bottom */
      margin-bottom: 20px;
  }
  
  .spin-button:hover {
      background-color: #367c39;
  }
  
  .result {
      font-size: 1.2rem;
      margin-top: 20px;
      color: #ddd;
  }
  
  .reel-text {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      animation: none;
      transform-style: preserve-3d;
      transition: transform 0.5s ease-in-out;
  }
  
  .reel-text.spinning {
      animation: rotateReel 0.7s linear forwards;
  }
  
  @keyframes rotateReel {
      from {
          transform: rotateX(0deg);
      }
      to {
          transform: rotateX(360deg);
      }
  }
  
  #balanceChart {
      background-color: #333;
      border-radius: 8px;
      margin-bottom: 20px;
      color: #fff;
  }
  
  .controls-container {
      position: absolute;
      top: 20px;
      left: 20px;
      background-color: rgba(0, 0, 0, 0.5);
      padding: 10px;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #aaa;
      text-align: left;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .controls-container p {
      margin: 5px 0;
  }
  
  .risk {
      font-size: 1.2rem;
      margin-bottom: 20px;
      color: #ddd;
  }
</style>
