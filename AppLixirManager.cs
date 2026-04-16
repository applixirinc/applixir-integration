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
        OnAdStatusReceived("ad-watched");
#endif
    }

    // This method is called by the JS bridge with the ad status
    public void OnAdStatusReceived(string status)
    {
        Debug.Log("AppLixir ad status: " + status);

        switch (status)
        {
            case "ad-watched":
                // ✅ Grant the reward
                GrantReward();
                break;

            case "no-ad":
                Debug.Log("No ad available right now.");
                break;

            case "ad-skipped":
                Debug.Log("Ad was skipped. No reward.");
                break;

            case "ad-error":
            case "sdk-not-loaded":
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
