> 本篇文章主要包括两方面，如何从0开始把RN（react-native）项目整合进入现有android项目，以及我们做的第一个RN的上线项目遇到的一些坑。

> 初次做RN项目，我们选择做了一个逻辑相对简单的转转app内部的帮助中心项目。整个项目有4个页面用的RN，其他页面走的是native提供的统跳协议，跳转到对应的native页面或者是H5页面。

## 整合RN到android项目中
> react-native cli提供的init指令，可以帮助我们创建一个RN的工程，但是很多场景下RN都是移植进入原生android或者iOS中。例如应该如何实现，在android页面，点击一个按钮进入RN页面呢？

<img src="http://img.58cdn.com.cn/zhuanzhuan/zzRNBlog/rnNativeandroid.png" style="width:50%;height:auto;" />

下面是具体的实现过程。

### 1.新建一个Android项目

![](http://img.58cdn.com.cn/zhuanzhuan/zzRNBlog/newandroid.png)

注意Minimum SDK选择API23以上,一路next后finish。

### 2.添加JS

打开studio的Terminal窗口，输入如下命令：

> npm init
会让你输入一些初始化package.json 的配置信息，例如:

![](http://img.58cdn.com.cn/zhuanzhuan/zzRNBlog/npminit.png)

按照提示输入就行了。
这一步完成之后，在项目的根目录下就会生成package.json这个文件，下一步输入：

> npm install react@16.0.0-alpha.6 - -save
> npm install react-native@^0.44.0 - -save

**注意，一定优先安装react哦。**

大约一两分钟的样子（如果卡到这里了，看看安装时是不是忘了配置镜像），完成之后你的根目录下会多了一个node_modules的文件夹，里面存放了下载好的React 和React Native。这里有童鞋可能会质疑为什么不把react和react-native的依赖直接写入package.json中，然后直接npm install，如果这么做的化，npm run start启动的时候会报如下的错误：

![](http://img.58cdn.com.cn/zhuanzhuan/zzRNBlog/propsTypeerror.png)

接下来把如下命令粘贴到package.json 文件下 scripts标签中

> "start": "node node_modules/react-native/local-cli/cli.js start"

下一步，在根目录下创建index.android.js文件并把如下代码粘贴到其中：

        'use strict';

        import React from 'react';
        import {
          AppRegistry,
          StyleSheet,
          Text,
          View
        } from 'react-native';

        class HelloWorld extends React.Component {
          render() {
            return (
              <View style={styles.container}>
                <Text style={styles.hello}>Hello, World</Text>
              </View>
            )
          }
        }
        var styles = StyleSheet.create({
          container: {
            flex: 1,
            justifyContent: 'center',
          },
          hello: {
            fontSize: 20,
            textAlign: 'center',
            margin: 10,
          },
        });
        AppRegistry.registerComponent('HelloWorld', () => HelloWorld);

代码很简单，居中显示一个HelloWorld。

### 3.项目配置（android）

用android studio打开工程，修改android根目录下Gradle Scripts的build.gradle（Module：app）文件添加如下内容,注意下面appcompat-v7版本为25.2.0，而且我把dependencies中test相关的依赖移除掉了，避免不必要的bug。

        apply plugin: 'com.android.application'
        apply from: "../node_modules/react-native/react.gradle"

        android {
        compileSdkVersion 25
        buildToolsVersion "25.0.2"
        defaultConfig {
            applicationId "com.example.lifeifei.reactnativeinit"
            minSdkVersion 16
            targetSdkVersion 25
            versionCode 1
            versionName "1.0"
            testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
        }
        buildTypes {
            release {
                minifyEnabled false
                proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            }
        }

        configurations.all {
            resolutionStrategy.force 'com.google.code.findbugs:jsr305:1.3.9'
        }
        }

        dependencies {
          compile fileTree(dir: 'libs', include: ['*.jar'])
          compile 'com.android.support:appcompat-v7:25.2.0'
          compile 'com.facebook.react:react-native:+'
        }

在build.gradle（Project：***）中添加依赖

      allprojects {
        repositories {
            mavenLocal()
            jcenter()
            maven {
                // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
                url "$rootDir/node_modules/react-native/android"
            }
        }
      }

继续下一步，在AndroidManifest.xml中添加网络访问权限

    <uses-permission android:name="android.permission.INTERNET" />

### 4.创建Activity

以下几步不要安装官网的去做，官网的步骤太麻烦，而且很久没有更新了。

1.新建一个Activity，让其继承ReactActivity，并重写getMainComponentName(),返回我们在index.android.js中注册的HelloWorld这个组件。

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
            return "HelloWorld";
          }
        }

别忘了把这个activity加入app/manifests/AndroidManifest.xml文件中

![](http://img.58cdn.com.cn/zhuanzhuan/zzRNBlog/manifest.png)

2.自定义一个Application，继承ReactApplication ，编写以下代码：

        public class App extends Application implements ReactApplication {

            private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
                @Override
                public boolean getUseDeveloperSupport() {
                    return BuildConfig.DEBUG;
                }

                @Override
                protected List<ReactPackage> getPackages() {
                    return Arrays.<ReactPackage>asList(
                            new MainReactPackage()
                    );
                }
            };
            @Override
            public ReactNativeHost getReactNativeHost() {
                return mReactNativeHost;
            }
        }

记得在AndroidManifest.xml中引用

> android:name=".App"

3.在目录res/layout中增加activity_main.xml文件，内容如下：
        ```
        <?xml version="1.0" encoding="utf-8"?>
        <RelativeLayout
            xmlns:android="http://schemas.android.com/apk/res/android"
            xmlns:tools="http://schemas.android.com/tools"
            android:id="@+id/activity_main"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:paddingBottom="@dimen/activity_vertical_margin"
            android:paddingLeft="@dimen/activity_horizontal_margin"
            android:paddingRight="@dimen/activity_horizontal_margin"
            android:paddingTop="@dimen/activity_vertical_margin"
            tools:context="com.example.lifeifei.reactnativeinit.MainActivity">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Hello World!"
                android:id="@+id/start_rn_btn"/>
        </RelativeLayout>
        ```    

在MainActivity中通过按钮启动我们的ReactNativeActivity

        public class MainActivity extends AppCompatActivity {

            @Override
            protected void onCreate(Bundle savedInstanceState) {
                super.onCreate(savedInstanceState);
                setContentView(R.layout.activity_main);
                findViewById(R.id.start_rn_btn).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        startActivity(new Intent(MainActivity.this, ReactNativeActivity.class));
                    }
                });
            }
        }

4.app/src/main下新建assets文件夹。
运行如下命令

> react-native start

然后直接在android studio工程中，点击上方工具栏的“run”按钮，应该就可以了。
如果卡在了这一步：
![](http://img.58cdn.com.cn/zhuanzhuan/zzRNBlog/loadingdependency.png)

没关系，用资源管理器打开你工程的根目录，在此目录下重新运行一个命令行并在其中输入如下命令

> react-native bundle - -platform android - -dev false - -entry-file index.android.js - -bundle-output app/src/main/assets/index.android.bundle - -assets-dest app/src/main/res/

完成之后assets目录下会生成以下两个文件

![](http://img.58cdn.com.cn/zhuanzhuan/zzRNBlog/assets.png)

确认一下react native service处于运行状态，然后正常运行你的APP，点击start，如果出现

![](http://img.58cdn.com.cn/zhuanzhuan/zzRNBlog/runok.png)

恭喜你！你已经成功入坑，但是，实际项目中并不是这么简单！

## 项目实战踩坑

### 1.技术栈
es6 + redux + react-redux + redux-thunk + react-navigation

### 2.项目心得
#### 这个项目踩坑最多的地方还是在react-navigation的使用上：
1.同一页面参数不同，多次回退始终进入同一个页面：
* 比如详情页页面a/cateId/xy，当传入不同cateId参数“cd”跳转到同一详情页a/cateId/cd的时候，页面是正常改变的，但是回退的时候，第一次是回到a/cateId/cd，再次回退还是回到a/cateId/cd。不会触发页面render。
* stackNavigator导航管理的页面，在切换的时候，不是按照堆栈的push，pop形式，而是通过移动指针到对应的页面，同时标记此页面为激活状态。
* 解决办法是通过componentWillReceiveProps，shouldComponentUpdate以及componentDidUpdate，当nextProps中的params.cateId和当前的params.cateId不同的时候，触发页面的render。

2.实现手势swipe向右滑动后退功能：
* 官方文档介绍，react-navigation在根组件的navigationOptions设置中添加gesturesEnabled: true，就可以实现滑动切换切换页面的需求，但是在真机上测试不生效。
* 通过读源码了解到，react-navigation内部是通过引入RN的PanResponder手势识别系统来实现滑动的机制，只有在onMoveShouldSetPanResponder返回true的时候，才能执行接下来的手势动作。具体执行方法如下：

```
    onMoveShouldSetPanResponder: (
        event: { nativeEvent: { pageY: number, pageX: number } },
        gesture: any
    ) => {
        if (index !== scene.index) {
          return false;
        }
        ...
        // Compare to the gesture distance relavant to card or modal
        const gestureResponseDistance = isVertical
          ? GESTURE_RESPONSE_DISTANCE_VERTICAL
          : GESTURE_RESPONSE_DISTANCE_HORIZONTAL;
        // GESTURE_RESPONSE_DISTANCE is about 25 or 30. Or 135 for modals
        if (screenEdgeDistance > gestureResponseDistance) {
          // Reject touches that started in the middle of the screen
          return false;
        }

        const hasDraggedEnough =
          Math.abs(currentDragDistance) > RESPOND_THRESHOLD;

        const isOnFirstCard = immediateIndex === 0;
        const shouldSetResponder =
          hasDraggedEnough && axisHasBeenMeasured && !isOnFirstCard;
        return shouldSetResponder;
    },
```

因为上述代码中的 **GESTURE_RESPONSE_DISTANCE_HORIZONTAL** 过小，导致始终return false，把这个值从20改到60就可以了。

3.实现页面跳转动画效果
* StackNavigator(RouteConfigs, StackNavigatorConfig)；
在第二个参数StackNavigatorConfig的配置中，可以传入mode: 'card',这个参数会在native端获取默认的滑动效果，iOS端默认的是左右切换的效果，但是android端默认的是上下切换效果。为了实现统一的过场效果。
* 幸好react-navigation提供了一个transitionConfig接口，可以实现定制化滑屏效果。不知道该如何定制么？没有关系，源码中已经在iOS端帮我们实现，稍微修改一下代码就可以了。

    ```
    transitionConfig: () => ({
        screenInterpolator: sceneProps => {
            const { layout, position, scene } = sceneProps;
            const { index } = scene;

            const translateX = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [layout.initWidth, 0, 0]
            });

            const opacity = position.interpolate({
                inputRange: [index - 1, index - 0.99, index, index + 0.99, index + 1],
                outputRange: [0, 1, 1, 0.3, 0]
            });

            return { opacity, transform: [{ translateX }] }
        }
    })
    ```

#### FlatList问题：
1.ListHeaderComponent，ListFooterComponent
* 当FlatList有并列的组件的时候，会出现，其他并列的组件位置是固定的（类似于css中的position fixed），页面只有FlatList区域是可以滚动的，为了实现这个页面整体是可以滚动的，需要把FlatList上面的组件加入FlatList的ListHeaderComponent属性中，同时把其下面的组件加入到ListFooterComponent中。

2.通过利用getItemLayout，把高度提前设定好，可以较少一次RN计算高度的render。

#### 图片问题：
1.RN中的图片有两种来源：native内部图片，cdn的图片。
* native内部图片，直接可以通过require图片名字取到，一定不要加.png等后缀。
例如：

    ```
    var zhuanzhuanPic = require('zhuanCat');
    <Image
        source={{uri: zhuanzhuanPic}}
    />
    ```

当然我们可以通过在打包的时候把通过相对路径引入的内部图片，
例如：

    ```
    //本地图片
    <Image source={require('./something.jpg')} />
    ```

通过配置--asset-dest打包进入native原生目录res中，这时候要注意，打出来的RN的bundle，只有放入android的assets文件夹下才能根据相对路径取到这些存放在res目录中的图片。

* cdn的图片，只有指定图片的宽高才能够显示出来。

#### 与native交互的处理
- 1.NativeModules：native暴露出来的模块，可以通过NativeModules对象取到。

- 2.有些场景需要native直接传递某些参数到RN端，iOS可以通过调用initWithBundleURL，在initialProperties参数传参，android通过getLaunchOptions把参数写入返回的bundle中。在RN工程的根文件（例如app.js），通过this.props.key（key是属性名字）直接取到。


[1]: https://www.raywenderlich.com/136047/react-native-existing-app

参考页面：
http://moduscreate.com/swift-modules-for-react-native/；
