// AppLixirBridge.jslib
// Unity WebGL bridge for AppLixir rewarded video ads
// Place this file in: Assets/Plugins/WebGL/AppLixirBridge.jslib

mergeInto(LibraryManager.library, {

  // Call this from C# to initialize and play a rewarded ad
  // The callbackObjectName is the name of your Unity GameObject
  // The callbackMethodName is the C# method to call with the result
  PlayRewardedAd: function(callbackObjectNamePtr, callbackMethodNamePtr) {
    var callbackObjectName = UTF8ToString(callbackObjectNamePtr);
    var callbackMethodName = UTF8ToString(callbackMethodNamePtr);

    var container = document.getElementById("applixir-ad-container");
    if (!container) {
      // Create container if it doesn't exist
      container = document.createElement("div");
      container.id = "applixir-ad-container";
      container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;";
      document.body.appendChild(container);
    }

    var options = {
      apiKey: "YOUR-API-KEY-HERE", // Replace with your actual API key
      injectionElementId: "applixir-ad-container",

      adStatusCallbackFn: function(status) {
        // status is an OBJECT { type, ad?, error? }. Unity SendMessage only
        // accepts a string, so forward status.type (e.g. "complete").
        SendMessage(callbackObjectName, callbackMethodName, status.type);
      },

      adErrorCallbackFn: function(error) {
        // Bridge-internal sentinel (not an SDK status type).
        SendMessage(callbackObjectName, callbackMethodName, "error");
      },
    };

    if (typeof initializeAndOpenPlayer === "function") {
      initializeAndOpenPlayer(options);
    } else {
      SendMessage(callbackObjectName, callbackMethodName, "sdk-not-loaded");
    }
  },

});
