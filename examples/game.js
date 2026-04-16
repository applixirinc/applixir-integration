// AppLixir integration for Phaser 3
// Drop this into your Phaser Scene where you want to show rewarded ads

// ─── In your HTML file ────────────────────────────────────────────────────────
// Add BEFORE your Phaser script tag:
// <script src="https://cdn.applixir.com/applixir.app.v6.0.1.js"></script>
// <div id="applixir-ad-container" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:9999;display:none;"></div>

// ─── In your Phaser Scene ─────────────────────────────────────────────────────

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    // Add a "Watch Ad" button in your scene
    const adButton = this.add.text(400, 300, "🎬 Watch Ad for Extra Life", {
      fontSize: "20px",
      backgroundColor: "#4CAF50",
      padding: { x: 16, y: 10 },
    })
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => this.showRewardedAd());
  }

  showRewardedAd() {
    // Show the container div before calling the player
    const container = document.getElementById("applixir-ad-container");
    if (container) container.style.display = "block";

    const options = {
      apiKey: "YOUR-API-KEY-HERE", // Get from https://client.applixir.com
      injectionElementId: "applixir-ad-container",

      adStatusCallbackFn: (status) => {
        console.log("AppLixir status:", status);

        if (status === "ad-watched") {
          // ✅ Grant reward — user watched the full ad
          this.grantExtraLife();
          this.hideAdContainer();
        } else if (status === "no-ad") {
          this.showMessage("No ads available right now.");
          this.hideAdContainer();
        } else if (status === "ad-skipped") {
          this.hideAdContainer();
        }
      },

      adErrorCallbackFn: (error) => {
        console.error("AppLixir error:", error.getError().data);
        this.hideAdContainer();
      },
    };

    if (typeof initializeAndOpenPlayer === "function") {
      initializeAndOpenPlayer(options);
    } else {
      console.error("AppLixir SDK not loaded. Check your script tag.");
    }
  }

  hideAdContainer() {
    const container = document.getElementById("applixir-ad-container");
    if (container) container.style.display = "none";
  }

  grantExtraLife() {
    // TODO: Add your game reward logic
    console.log("Reward granted!");
  }

  showMessage(text) {
    // TODO: Show a toast or message to the player
    console.log(text);
  }
}

// ─── Phaser game config ───────────────────────────────────────────────────────
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameScene,
};

const game = new Phaser.Game(config);
