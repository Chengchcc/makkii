package com.makkii;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.bitgo.randombytes.RandomBytesPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.web3webview.Web3WebviewPackage;
import com.horcrux.svg.SvgPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import org.reactnative.camera.RNCameraPackage;
import com.reactlibrary.RNAionHwWalletPackage;
;

import android.webkit.WebView;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RandomBytesPackage(),
            new RNFetchBlobPackage(),
            new Web3WebviewPackage(),
            new SvgPackage(),
            new RNI18nPackage(),
            new RNGestureHandlerPackage(),
            new RNFSPackage(),
            new RNDeviceInfo(),
            new RNCameraPackage(),
            new RNAionHwWalletPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    WebView.setWebContentsDebuggingEnabled(true);
    SoLoader.init(this, /* native exopackage */ false);
  }
}
