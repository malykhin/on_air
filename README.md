# On Air

![3D7262B5-DD7C-4B79-B4B2-1DB69BFE7F54](https://user-images.githubusercontent.com/15819745/184469051-e8bb5a4a-b7da-4c45-90ff-2ca3d01acf46.JPG)

Software for the 'On Air' sign controlled by Mac's microphone status. It lights up when microphone is active.

# Installation

1. Create `params.py` frole from `params_sample.py`. Fill proper values for `uuid` and `password` and change other params if needed.
2. Copy *.py files to your reaspberry pi pico w.
3. Execute the script on pi and save IP address from the console.
4. Create `watcher_params.json` from `watcher_params_sample.json`.
5. Fill the `SIGN_ADDRESS` in `watcher_params.json` using saved IP address.
6. Execute `./setup_watcher_autoload.js` to setup automatic script execution on user login.
