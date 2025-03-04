package com.pushengagereactnative

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.CxxCallbackImpl
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import com.pushengage.pushengage.Callbacks.PushEngageResponseCallback
import com.pushengage.pushengage.PushEngage
import com.pushengage.pushengage.helper.PEConstants
import com.pushengage.pushengage.helper.PEPrefs
import com.pushengage.pushengage.model.request.AddDynamicSegmentRequest
import com.pushengage.pushengage.model.request.Goal
import com.pushengage.pushengage.model.request.TriggerAlert
import com.pushengage.pushengage.model.request.TriggerCampaign
import java.text.SimpleDateFormat
import java.util.Locale
import org.json.JSONObject

@ReactModule(name = PushengageReactNativeModule.NAME)
class PushengageReactNativeModule(reactContext: ReactApplicationContext) :
        NativePushengageReactNativeSpec(reactContext), ActivityEventListener, PermissionListener {

  private var permissionResult: Promise? = null

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun setEventEmitterCallback(eventEmitterCallback: CxxCallbackImpl) {
    super.mEventEmitterCallback = eventEmitterCallback
  }


  override fun getName(): String {
    return NAME
  }

  override fun setAppId(appId: String?) {

    val pe = PushEngage.Builder().addContext(reactApplicationContext).setAppId(appId).build()
  }

  override fun getSdkVersion(): String {
    return "0.0.1"
  }

  override fun setSmallIconResource(resourceName: String?, promise: Promise?) {
    PushEngage.setSmallIconResource(resourceName)
    promise?.resolve(null)
  }

  override fun getDeviceTokenHash(promise: Promise?) {
    promise?.resolve(PushEngage.getDeviceTokenHash())
  }

  override fun enableLogging(shouldEnable: Boolean) {
    PushEngage.enableLogging(shouldEnable)
  }

  override fun automatedNotification(status: Boolean, promise: Promise?) {
    PushEngage.automatedNotification(
            if (status) PushEngage.TriggerStatusType.enabled
            else PushEngage.TriggerStatusType.disabled,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any) {
                promise?.resolve(
                        "Automated notification ${if (status) "enabled" else "disabled"} successfully"
                )
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun sendTriggerEvent(trigger: ReadableMap?, promise: Promise?) {
    val triggerCampaign =
            TriggerCampaign(
                    campaignName = trigger?.getString("campaignName") ?: "",
                    eventName = trigger?.getString("eventName") ?: "",
                    referenceId = trigger?.getString("referenceId"),
                    profileId = trigger?.getString("profileId"),
                    data = trigger?.getMap("data")?.toHashMap() as? Map<String, String>
            )
    PushEngage.sendTriggerEvent(
            triggerCampaign,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any) {
                promise?.resolve("Trigger sent successfully")
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun sendGoal(goal: ReadableMap?, promise: Promise?) {
    val goal =
            Goal(
                    name = goal?.getString("name") ?: "",
                    count = goal?.getInt("count"),
                    value = if (goal?.hasKey("value") == true && !goal.isNull("value")) {
                              try {
                                goal.getDouble("value")
                              } catch (e: Exception) {
                                null
                              }
                            } else {
                              null
                            },
            )
    PushEngage.sendGoal(
            goal,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any) {
                promise?.resolve("Goal sent successfully")
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun addAlert(alert: ReadableMap?, promise: Promise?) {
    val alert =
            TriggerAlert(
                    type = getAlertType(alert?.getString("type") ?: ""),
                    productId = alert?.getString("productId") ?: "",
                    link = alert?.getString("link") ?: "",
                    price = if (alert?.hasKey("price") == true && !alert.isNull("price")) {
                      try {
                        alert.getDouble("price")
                      } catch (e: Exception) {
                        0.0
                      }
                    } else {
                      0.0
                    },
                    variantId = alert?.getString("variantId")?.takeIf { it.isNotEmpty() },
                    expiryTimestamp = alert?.getString("expiryTimestamp")?.let {
                      try {
                        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS", Locale.getDefault()).parse(it)
                      } catch (e: Exception) {
                        null
                      }
                    },
                    alertPrice = if (alert?.hasKey("alertPrice") == true && !alert.isNull("alertPrice")) {
                      try {
                        alert.getDouble("alertPrice")
                      } catch (e: Exception) {
                        null
                      }
                    } else {
                      null
                    },
                    availability = alert?.getString("availability")?.takeIf { it.isNotEmpty() }?.let {
                      try {
                        PushEngage.TriggerAlertAvailabilityType.valueOf(it)
                      } catch (e: IllegalArgumentException) {
                        null
                      }
                    },
                    profileId = alert?.getString("profileId")?.takeIf { it.isNotEmpty() },
                    mrp = if (alert?.hasKey("mrp") == true && !alert.isNull("mrp")) {
                      try {
                        alert.getDouble("mrp")
                      } catch (e: Exception) {
                        null
                      }
                    } else {
                      null
                    },
                    data = alert?.getMap("data")?.toHashMap() as? Map<String, String>
            )
    PushEngage.addAlert(
            alert,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any) {
                promise?.resolve("Alert added successfully")
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun getSubscriberDetails(values: ReadableArray?, promise: Promise?) {
    val subscriberAttributes = values?.toArrayList()?.map { it.toString() }
    PushEngage.getSubscriberDetails(
            subscriberAttributes,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any?) {
                try {
                  when (responseObject) {
                    null -> promise?.resolve(null)
                    is Map<*, *> -> promise?.resolve(convertMapToWritable(responseObject))
                    else -> promise?.resolve(null)
                  }
                } catch (e: Exception) {
                  promise?.reject("ERROR", "Failed to convert response", e)
                }
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun requestNotificationPermission(promise: Promise?) {
    val activity = currentActivity as PermissionAwareActivity? ?: return

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (ContextCompat.checkSelfPermission(
                      reactApplicationContext,
                      Manifest.permission.POST_NOTIFICATIONS
              ) != PackageManager.PERMISSION_GRANTED
      ) {
        permissionResult = promise
        activity.requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 100, this)
      } else {
        promise?.resolve(true)
      }
    } else {
      promise?.resolve(true)
    }
  }

  private fun convertMapToWritable(map: Map<*, *>): WritableMap {
    val writableMap = Arguments.createMap()
    map.forEach { (key, value) ->
      when (value) {
        is String -> writableMap.putString(key.toString(), value)
        is Int -> writableMap.putInt(key.toString(), value)
        is Double -> writableMap.putDouble(key.toString(), value)
        is Boolean -> writableMap.putBoolean(key.toString(), value)
        is Map<*, *> -> writableMap.putMap(key.toString(), convertMapToWritable(value))
        null -> writableMap.putNull(key.toString())
      }
    }
    return writableMap
  }

  override fun getSubscriberAttributes(promise: Promise?) {
    PushEngage.getSubscriberAttributes(
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any?) {
                try {
                  when (responseObject) {
                    null -> promise?.resolve(null)
                    is Map<*, *> -> promise?.resolve(convertMapToWritable(responseObject))
                    else -> promise?.resolve(null)
                  }
                } catch (e: Exception) {
                  promise?.reject("ERROR", "Failed to convert response", e)
                }
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun addSegment(segments: ReadableArray?, promise: Promise?) {
    val segmentList = segments?.toArrayList()?.map { it.toString() }
    PushEngage.addSegment(
            segmentList,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any?) {
                promise?.resolve("Subscriber added to segment(s) successfully")
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun removeSegment(segments: ReadableArray?, promise: Promise?) {
    val segmentList = segments?.toArrayList()?.map { it.toString() }
    PushEngage.removeSegment(
            segmentList,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any?) {
                promise?.resolve("Subscriber removed from segment(s) successfully")
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun addDynamicSegment(segments: ReadableArray?, promise: Promise?) {
    val segmentsList = segments?.toArrayList()?.map { it as Map<String, Any> }
    val dynamicSegments: MutableList<AddDynamicSegmentRequest.Segment> = ArrayList()
    segmentsList?.forEach { map ->
      val segment = AddDynamicSegmentRequest().Segment()
      segment.name = map["name"] as String
      segment.duration = (map["duration"] as Number).toLong()
      dynamicSegments.add(segment)
    }
    PushEngage.addDynamicSegment(
            dynamicSegments,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any?) {
                promise?.resolve("Subscriber added to dynamic segment successfully")
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun addSubscriberAttributes(attributes: ReadableMap?, promise: Promise?) {
    try {
      val jsonObject = JSONObject(attributes?.toHashMap() as Map<String, String>)
      PushEngage.addSubscriberAttributes(
              jsonObject,
              object : PushEngageResponseCallback {
                override fun onSuccess(responseObject: Any?) {
                  promise?.resolve("Subscriber attribute(s) added successfully")
                }

                override fun onFailure(errorCode: Int, errorMessage: String) {
                  promise?.reject(errorCode.toString(), errorMessage)
                }
              }
      )
    } catch (e: Exception) {
      promise?.reject("INVALID_ARGUMENT", "Missing required arguments")
    }
  }

  override fun deleteSubscriberAttributes(attributes: ReadableArray?, promise: Promise?) {
    val attributeList = attributes?.toArrayList()?.map { it.toString() }
    PushEngage.deleteSubscriberAttributes(
            attributeList,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any?) {
                promise?.resolve("Subscriber attribute(s) deleted successfully")
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun addProfileId(profileId: String?, promise: Promise?) {
    PushEngage.addProfileId(
            profileId,
            object : PushEngageResponseCallback {
              override fun onSuccess(responseObject: Any?) {
                promise?.resolve("Profile Id added successfully")
              }

              override fun onFailure(errorCode: Int, errorMessage: String) {
                promise?.reject(errorCode.toString(), errorMessage)
              }
            }
    )
  }

  override fun setSubscriberAttributes(attributes: ReadableMap?, promise: Promise?) {
    try {
      val jsonObject = JSONObject(attributes?.toHashMap() as Map<String, String>)
      PushEngage.setSubscriberAttributes(
              jsonObject,
              object : PushEngageResponseCallback {
                override fun onSuccess(responseObject: Any?) {
                  promise?.resolve("Subscriber attribute(s) set successfully")
                }

                override fun onFailure(errorCode: Int, errorMessage: String) {
                  promise?.reject(errorCode.toString(), errorMessage)
                }
              }
      )
    } catch (e: Exception) {
      promise?.reject("400", "Invalid input")
    }
  }

  override fun onActivityResult(p0: Activity?, p1: Int, p2: Int, p3: Intent?) {}

  override fun onNewIntent(p0: Intent?) {
    p0?.let { handleIntent(it) }
  }

  private fun handleIntent(intent: Intent) {
    val action = intent.action
    val data = intent.data
    if (Intent.ACTION_VIEW == action && data != null) {
      val deepLink = data.toString()
      val additionalData = intent.extras?.get("data")
      val additionalDataMap: Map<out Any, Any> = if (additionalData is String) {
        try {
          val jsonObject = JSONObject(additionalData)
          jsonObject.keys().asSequence().associateWith { jsonObject.get(it) }
        } catch (e: Exception) {
          emptyMap<Any, Any>()
        }
      } else {
        emptyMap<Any, Any>()
      }

      val writableMap =
              Arguments.createMap().apply {
                putString("deepLink", deepLink)
                additionalData?.let { putMap("data", convertMapToWritable(additionalDataMap)) }
              }
      emitOnValueChanged(writableMap)
    }
  }

  private fun getAlertType(type: String): PushEngage.TriggerAlertType {
    return if (type == "priceDrop") {
      PushEngage.TriggerAlertType.priceDrop
    } else {
      PushEngage.TriggerAlertType.inventory
    }
  }

  companion object {
    const val NAME = "PushengageReactNative"
  }

  override fun onRequestPermissionsResult(
          requestCode: Int,
          permissions: Array<String>,
          grantResults: IntArray
  ): Boolean {
    when (requestCode) {
      100 -> { // The request code used in requestPermissions
        val isGranted =
                grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
        permissionResult?.resolve(isGranted)
        PushEngage.subscribe()
        return true
      }
    }
    return false
  }
}
