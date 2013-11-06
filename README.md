Toolbox
=======

App to perform test cloud call and miscellaneous checks.  Based on the Node smoke test app with a few tweaks.

The app works on 2 levels.  The first being as an app to be deployed on a device.  

Currently, it performs 2 functions, perform a Redis call and perform a Ditch call.
These can be accessed by pressing the relevent buttons under the "Test Cloud Functionality"
button.

The 2nd level is as a health check.  The app exposes 3 endpoints 
(Redis, Ditch and General Health) that are monitored in Pingdom.

