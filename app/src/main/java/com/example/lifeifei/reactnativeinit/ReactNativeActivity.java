package com.example.lifeifei.reactnativeinit;

/**
 * Created by lifeifei on 28/04/2017.
 */
import javax.annotation.Nullable;

import com.facebook.react.ReactActivity;

public class ReactNativeActivity extends ReactActivity {
    @Nullable
    @Override
    protected String getMainComponentName(){
        return "ReduxExample";
    }
}
