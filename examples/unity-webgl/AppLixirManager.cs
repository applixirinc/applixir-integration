// AppLixirManager.cs
// Attach this script to a GameObject in your Unity scene
// Works with AppLixirBridge.jslib for WebGL builds

using UnityEngine;
using System.Runtime.InteropServices;

public class AppLixirManager : MonoBehaviour
{
    // Import the JS bridge function
    [DllImport("__Internal")]
    private static extern void PlayRewardedAd(string callbackObjectName, string callbackMethodName);

    // Call this from your game logic (e.g., when player runs out of lives)
    public void ShowRewardedAd()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        // "AppLixirManager" must match this GameObject's name in the Hierarchy
        PlayRewardedAd("AppLixirManager", "OnAdStatusReceived");
#else
        Debug.Log("AppLixir only runs in WebGL builds. Simulating reward for testing.");
        OnAdStatusReceived("complete");
#endif
    }

    // This method is called by the JS bridge with the ad status.
    // The bridge sends status.type (a string) — see AppLixirBridge.jslib.
    public void OnAdStatusReceived(string status)
    {
        Debug.Log("AppLixir ad status: " + status);

        switch (status)
        {
            case "complete":
                // ✅ User watched the full ad — grant the reward.
                GrantReward();
                break;

            case "allAdsCompleted":
                // Fires at the end of any ad AND when no ad was available.
                // Not a reward signal — use it to clean up / re-enable UI.
                break;

            case "skipped":
            case "manuallyEnded":
                Debug.Log("Ad skipped or closed early. No reward.");
                break;

            case "consentDeclined":
                Debug.Log("User declined personalized-ads consent. No reward.");
                break;

            case "error":
            case "sdk-not-loaded":
                // Bridge-internal sentinels (see AppLixirBridge.jslib).
                Debug.LogWarning("AppLixir error: " + status);
                break;
        }
    }

    private void GrantReward()
    {
        // TODO: Add your reward logic here
        Debug.Log("Reward granted!");
    }
}
