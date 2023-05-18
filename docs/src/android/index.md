---
{
   "title": "Android",
   "date": "2021-06-02",
   "category": "技术",
   "tags": ["android"]
}
---
# Android

## 1. Activity生命周期和启动模式

### 生命周期

1. 正常情况下

   1. ```onCreate```：表示Activity正在被创建。生命周期的第一个方法，做一些初始化工作

   2. ```onRestart```：表示Activity正在重新启动。当Activity从不可见变为可见状态时，该方法被调用。一般由用户行为导致，从桌面返回该Activity或从下一个Activity返回该Activity。

   3. ```onStart```：表示Activity正在被启动。此时Activity已经可见，但没有出现在前台，无法与用户交互。

   4. ```onResume```：表示Activity已经可见，并且出现在前台。

   5. ```onPause```：表示Activity正在停止，正常情况下，```onStop```紧接着被调用。在```onPause```中，可以做一些存储数据、停止动画， 但不能太耗时，```onPause```执行完，新Activity的```onResume```才会执行

   6. ```onStop```：表示Activity即将停止，做一些稍微重量级的回收工作，同样不能太耗时

   7. ```onDestroy```：表示Activity即将被销毁，做一些回收工作和最终的资源释放

      ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/activity_lifecycle.png)

2. 例子

   1. 特定的Activity第一次启动：```onCreate```->```onStart```->```onResume```
   2. 当用户打开新的Acticity或者返回桌面：```onPause```->```onStop```
   3. 当用户再次返回原Activity：```onRestart```->```onStart```->```onResmue```
   4. 当用户按下back键：```onPause```->```onStop```->```onDestory```
   5. 当Activity被系统回收之后重新打开，流程和1一样
   6. 对于整个生命周期，```onCreate```和```onDestory```配对，只有一次调用。```onStart```和```onStop```配对，多次调用。```onResume```和```onPause```配对，多次调用，表示Activity是否在前台。
   7. 当前Activity```onPause```执行完，新Activity的```onResume```才会执行, 然后才是A onStop

3. 异常情况下

   1. 资源相关的系统配置发生改变，如屏幕发生旋转，Activity发生重建。

      系统会调用```onSaveInstanceState```和```onRestoreInstanceState```来保存和恢复数据

   2. 内存不足导致低优先级的Activity被杀死

      数据存储过程和回复过程和1一致，

      1. 前台Activity，优先级最高
      2. 可见但非前台Activity，如Activity中弹出了一个对话框，导致Activity可见但位于后台
      3. 后台Activity，优先级最低

   3. 给Activity添加属性，资源发生改变时，可不重建Activity

      ```android:configChanges="orientation | locale | keyboardHidden"```

      屏幕方向改变、系统语言改变、键盘的可访问性发生改变

### 启动模式

1. standard

   标准模式，每次启动一个Activity都会重新创建一个新的实例，不管这个实例是否已经存在

2. singleTop

   栈顶复用模式，若Activity已经位于栈顶，那么他不会被重新创建，同时其```onNewIntent```会被回调。

   例如当前栈由ABCD，此时再次启动D，D不会被重建

3. singleTask

   栈内复用模式，是一种单实例模式，只要Activity在一个栈中存在，多次启动此Activity都不会被重建，也会回调onNewIntent. **保证了在一个Task内只有一个activity实例**

   例如：

   1. 当当前任务栈S1为ABC，D以singleTask启动，其所需要的任务栈为S2，由于S2和D都不存在，则系统会创建S2和D
   2. 假设D所需要的任务栈为S1，由于S1已经存在，则会直接创建D并入栈S1
   3. 若当前任务栈S1为ADBC，且D所需任务栈为S1，则启动D时，D不会被重建，D被切换到栈顶，且BC出栈。栈中为AD。（查找设置的标识是否和原来的相等默认为报名，相等则不重建，不相等则创建新的任务栈）

4. singleInstance

   单实例模式，一种加强的singleTask模式，除了具有singleTask特性之外，此模式的Activity只能单独的运行在一个任务栈中。

## 2. View的事件体系

1. 什么是View

   View是android中所有控件的基类。ViewGroup是一个控件组，ViewGroup也是继承自View。所以layout既是一个View又是一个ViewGroup。

2. View的位置参数

   View的四个顶点：top、left、right、bottom。分别对应左上角纵坐标、左上角横坐标、右下角横坐标、右下角纵坐标。这些坐标都相对于父容器来说。因此是一种相对坐标。

   所以可以得出坐标和View宽高的关系：

   ```java
   int width = right - left;
   int height = bottom - height;
   ```

   从android3.0开始，增加了x、y、translationX和translationY（触控点的相对父坐标位置）。其中x、y是view左上角的坐标、translationX和translationY是触控点相对于父容器的偏移量。且后两者默认值为0。

   几个参数的换算关系：

   ```java
   x = left + translationX;
   y = top + translationY;
   ```

   在View平移的过程中，top、left表示的是**原始**左上角的位置，其值并不会发生改变，此时改变的是x、y、translationX、translationY

3. MotionEvent和TouchSlop

   1. MotionEvent：

      - ACTION_DOWN：手指刚接触屏幕
      - ACTION_MOVE：手指在屏幕上移动
      - ACTION_UP：手指在屏幕上松开的一瞬间

      可以通过MotionEvent获取点击事件发生的x、y坐标。getX()/getY()返回相对于当前View左上角的x和y坐标，getRawX()/getRawY()返回相对于屏幕左上角的x和y坐标。

   2. TouchSlop：

      是屏幕所能识别出的被认为是滑动的最小距离，当滑动距离太短，系统就不认为他是一次滑动，这个常量和设备有关。

      通过```ViewConfiguration.get(getContext).getScaledTouchSlop()```获取。

4. VelocityTracker、GestureDetector和Scroller

   1. VelocityTracker用于追踪滑动过程中的速度

   2. GestureDetector用于辅助检测用户单击、滑动、长按、双击行为。

      一般只有双击行为使用GestureDetector，其他行为在onTouchEvent中实现。

   3. Scroller

      弹性滑动对象，用于实现View的弹性滑动。

5. 实现View的滑动

   1. 使用scrollTo/scrollBy

      由View本身提供。都只能改变view内容的位置而不能改变View在布局中的位置。

      scrollTo(int x, int y)：实现基于参数的绝对滑动

      scrollBy(int x, int y)：实现基于当前位置的相对滑动。

   2. 使用动画

      ```java
      // 将一个View在100ms内从原始位置向右平移100像素
      ObjectAnimator.ofFloat(targetView, "translationX", 0, 100).setDuration(100).start();
      ```

   3. 改变布局参数

      重新设置button的marginLeft，即可实现按钮的左右平移。或者在button左边添加一个空的、宽度为0的View，之后动态改变View的宽度。

      ```java
      MarginLayoutParams params = mButton.getLayoutParams();
      params.width += 100;
      params.leftMargin += 100;
      mButton.setLayoutParams(params);
      ```

      对比：

      - scrollTo/SscrollBy：操作简单、适合对View内容的滑动
      - 动画：操作简单，适用于没有交互的View(3.0之后也可交互)和实现复杂的动画效果
      - 改变布局参数：操作稍微复杂，适用于有交互的操作。

      实例：实现跟手滑动

      ```java
      public class MyMoveView extends View() {
          
          int mLastX = 0;
          int mLastY = 0;
          
          public boolean onTouchEvent(MotionEvent event) {
              int x = (int) event.getRawX();
              int y = (int) event.getRawY();
      
              if (event.getAction() == MotionEvent.ACTION_MOVE) {
                  int deltaX = x - mLastX;
                  int deltaY = y - mLastY;
                  setTranslationX(getTranslationX() + deltaX);
                  setTranslationY(getTranslationY() + dletaY);
              }
              return true
          }
          
          // 或者 呼叫layout方法
          @Override
          public boolean onTouchEvent(MotionEvent event) {
              int x = (int) event.getX();
              int y = (int) event.getY();
              switch (event.getAction()) {
                  case MotionEvent.ACTION_DOWN:
                      lastX = x;
                      lastY = y;
                      break;
                  case MotionEvent.ACTION_MOVE:
                      int deltaX = x - lastX;
                      int deltaY = y - lastY;
                      layout(getLeft() + deltaX, getTop() + deltaY, getRight() + deltaX, getBottom() + deltaY);
                      //offsetLeftAndRight(deltaX);
                      //offsetTopAndBottom(deltaY);
                      break;
                  case MotionEvent.ACTION_UP:
                          break;
              }
              return true;
          }
      }
      
      ```

6. 弹性滑动

   1. 使用Scroller

   2. 使用动画

   3. 使用延时策略

      如Handler的postDelayed方法。

7. **View的分发机制**

   1. 点击事件的传递规则

      点击事件的事件分发，就是MotionEvent事件的分发过程。当一个MotionEvent产生后，系统需要把这个事件传递给一个具体的View，而这个传递过程就是分发过程。该过程由以下三个方法共同完成。

      - ```public boolen dispatchTouchEvent(MotionEvent event)```

        用来进行事件的分发。如果事件能传递给当前View，那么此方法一定会被调用，返回结果受当前View的onTouchEvent和下级View的dispatchTouchEvent()的影响，表示是否消耗当前事件。

      - ```pulic boolen onInterceptTouchEvent(MotionEvent event)```

        在上述方法内部调用，用来判断是否拦截某个事件，如果当前View拦截了某个事件，那么在同一个事件序列中，此方法不会被再次调用。返回结果表示是都拦截当前事件。

      - ```public boolen onTouchEvent(MotionEvent event)```

        在第一个方法中调用，用来处理点击事件，返回结果表示是否消耗当前事件，如果不消耗，则在同一个事件序列中，当前View不会再次接收到事件。

      联系：

      ```java
      public boolean dispatchTouchEvent(MotionEvent evnet) {
          boolean consume = false;
          if (onInterceptTouchEvent(event)) {
      		consume = onTouchEvent(event);
          } else {
              consume = child.dispatchEvent(event);
          }
      }
      ```

      对于一个根ViewGroup来说，点击事件产生后，首先传递给他，他的```ondiaspatchTouchEvent```就会被调用，若```onInterceptTouchEvent()```返回为true表示他要拦截该事件，事件交给当前view处理，即他的onTouchEvent会被调用，否则表示他不拦截，交给下级view，子元素的```onDispatchEvent```会被调用，如此反复。

      **onTouchEvent返回false时，事件将交给上级。**

      一些结论：

      - 同一个事件序列是指从手指接触屏幕那一刻开始到手指离开屏幕为止。其中包含数量不定的move事件
      - 正常情况下，一个事件序列只能被一个View拦截且消耗。
      - 某个View一旦决定拦截，那么这一个事件序列都只能交给他来处理
      - 某个View一旦开始处理事件，如果他不消耗ACTION_DOWN事件(onTouchEvent返回了false)，那么同一事件序列的其他事件都不会交给他来处理，重新交给父元素，即父元素的onTouchEvent被调用。
      - 如果View不消耗出ACTION_DOWN以外的事件，那么这个点击事件会消失，父元素onTouchEvent不会被调用。并且当前View可以持续接受后续的事件，最终这些消失的事件会传递给Activity处理
      - ViewGroup默认不接收任何事件
      - View没有```onInterceptTouchEvent()```方法，事件一旦传递给他，他的onTouchEvent一定会被调用。
      - View的onTouchEvent默认都会消耗事件(返回true)，除非他是不可点击的(clickable和longclickable同时为false)。其中longclickable默认为false，clickable分情况，按钮的为true，textView为false。
      - View的enable属性不影响onTouchEvent的默认返回值。哪怕一个View是disable的，只要他clickable或longclickable为true，则onTouchEvent返回true。
      - onClick发生的前提是当前View是可点击的，并且他收到了down和up的事件
      - 事件传递过程是从外向内的，通过requestDisallowInterceptTouchEvent可以在子元素干预父元素的分发过程，但是ACTION_DOWN除外。

8. View的滑动冲突

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/%E6%BB%91%E5%8A%A8%E5%86%B2%E7%AA%81.jpg)

   - 场景1：外部滑动方向和内部滑动方向不一致
   - 场景2：外部滑动方向和内部滑动方向一致
   - 场景3：嵌套

   1. 场景1：

      类似ViewPager配合Fragement组成的页面滑动效果，其中Fragment中有ListView。ViewPager内部处理了这种冲突。

      处理规则：当左右滑动时，让外部的View拦截点击事件，当上下滑动时，让内部的View拦截点击事件。可比较水平滑动和竖直滑动的大小来判断是左右滑动还是上下滑动。

      解决方式：

      外部拦截伪代码：

      ```java
      // 重写父元素的onIntercepTouchEvent()方法（如自己的viewpager）
      public boolean onIntercepTouchEvent(MotionEvent event) {
          boolean intercepted = false;
          int x = (int) event.getX();
          int y = (int) event.getY();
          switch(event.getAction()) {
              case MotionEvent.ACTION_DOWN:
                  intercepted = false;
                  break;
              case MotionEvent.ACTION_MOVE:
                  if ("父容器需要当前点击事件") {
                      // Math.abs(deltaX)>Math.abs(deltaY)
                      intercepted = true;
                  } else {
                      intercepted = false;
                  }
                  break;
              case MotionEvent.ACTION_UP:
                  intercepted = false;
                  break;
              default:
                  break;       
          }
          
          mLastXIntercepted = x;
          mLastYIntercepted = y;
          return intercepted;
      }
      ```


## 3. View的工作原理

1. ViewRoot和DecorView

   - ViewRoot对应于ViewRootImpl类，是连接WindowManager和DecorView的纽带，View的三大流程都是通过ViewRoot来完成的。

   - View的绘制流程是从ViewRoot的```performTraversals```方法开始的，经过measure、layout、draw三个过程才能最终将一个View绘制出来。

      - measure：测量View的宽和高

        measure过程决定了View的宽和高，可以通过getMeasuredWidth和getMeasuredHeight方法获得View测量过后的宽和高，几乎左右情况都等于View最终的宽和高。

      - layout：确定View在父容器的放置位置

        决定了View的四个顶点和最终宽、高。可通过getTop、getBottom、getLeft、getRight拿到View四个顶点的位置，通过getWidth和getHeight得到最终宽高。

      - draw：负责将View绘制在屏幕上

        决定了View的显示

         - 绘制背景，调用View的drawBackground方法
         - 绘制View的内容，调用View的onDraw方法，该方法为空实现，需要自己实现。
         - 绘制子View，调用dispatchDraw方法，也是空实现。ViewGroup重写了这个方法，对子View进行遍历，调用drawChild方法
         - 绘制装饰

     <img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/performTraversals%E6%B5%81%E7%A8%8B%E5%9B%BE.jpg" alt="performTraversals流程图" style="zoom: 50%;" />

     如图：performTraversals一次调用performMeasure、performLayout、performDraw三个方法，这三个方法分别完成顶级View的measure、layout、draw三个流程，其中performTraversals中会调用measure方法，measure方法又会调用onMeasure方法，onMeasure中会对所有的子元素进行measure过程，这时候measure流程就传到子元素中，子元素重复上述流程，完成view树的遍历。

   - DecorView作为顶级View，包含一个竖直方向的LinearLayout，这个layout中有上下两部分，上面是标题栏，下面是内容栏，Activity中setContentView设置的布局文件就是加载到内容栏的，而内容栏的id是content。

     DecorView是一个FrameLayout，事件经过DecorView才传到我们定义的View。

2. MeasureSpec

   参与View的测量(Measure)过程。是view的一个内部类，封装了一个View的规格尺寸，在Measure过程中，系统将View的layoutParams根据父容器施加的规则转换成对应的MeasureSpec，然后在onMeasure方法中根据这个Measure来确定View的宽和高。

   MeasureSpec常量，代表32位int值，高2位表示SpecMode(测量模式)，低30位表示SpecSize(测量大小)。

   - UNSPECFIED：未指定模式，View想要多大就多大，父容器不做限制，一般用于系统内部的测量
   - AT_MOST：最大模式，对应于wrap_content属性，子View的最终大小是父View指定的SpecSize值，且子View不能大于这个值
   - EXACTLY：精确模式，对应于match_parent属性和具体的数值，父容器测量出view所需的大小，也就是SpecSize的值。

3. 坐标系

   1. android坐标系

      屏幕左上角为原点，getRowX()、getRowY()获取的坐标就是Android坐标系的坐标。

   2. View坐标系

      <img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/View%E5%9D%90%E6%A0%87%E7%B3%BB.png" style="zoom: 33%;" />

      其中getX()、getY()、getRawX()、getRawY()获取的是点击事件的位置

      getLeft()、、、获取的是View的位置。

4. 自定义视图

   1. 继承系统控件的自定义View

      在系统控件的基础上进行修改，一般添加新的功能或修改展示效果，一般在onDraw方法中进行处理。

      ```java
      // 自定义TextView，在文字中加条横线
      public class TextViewWithLine extends androidx.appcompat.widget.AppCompatTextView {
      
          private Paint mPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
      
          public TextViewWithLine(@NonNull Context context) {
              super(context);
              initDraw();
          }
      
          public TextViewWithLine(@NonNull Context context, @Nullable AttributeSet attrs) {
              super(context, attrs);
              initDraw();
          }
      
          public TextViewWithLine(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
              super(context, attrs, defStyleAttr);
              initDraw();
          }
          
          private void initDraw() {
              mPaint.setColor(Color.RED);
              mPaint.setStrokeWidth(1.5f);
          }
          
          @Override
          protected void onDraw(Canvas canvas) {
              super.onDraw(canvas);
      
              int width = getWidth();
              int height = getHeight();
              canvas.drawLine(0f, (float)height / 2,  width, (float) height / 2, mPaint);
          }
      }
      ```

   2. 继承View的自定义 View

      不只要实现onDraw，在实现时还要考虑wrap_content属性和padding的设置，为了方便配置自定义View，还要对外提供自定义的属性。如果要改变触控的逻辑，还要重写onTouchEvent等触控事件的方法。

      1. 简单实现继承View的自定义View(正方形)

         ```java
         public class RectView extends View {
         
             private Paint mPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
             private int mColor = Color.RED;
         
             public RectView(Context context) {
                 super(context);
                 initView();
             }
         
             public RectView(Context context, @Nullable AttributeSet attrs) {
                 super(context, attrs);
         
                 // values文件夹下新建attrs.xml，获取
                 TypedArray mTypedArray = context.obtainStyledAttributes(attrs, R.styleable.RectView);
                 mColor = mTypedArray.getColor(R.styleable.RectView_rect_color, Color.RED);
                 mTypedArray.recycle();  //及时释放
                 initView();
             }
         
             public RectView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
                 super(context, attrs, defStyleAttr);
                 initView();
             }
         
             private void initView() {
                 mPaint.setColor(mColor);
                 mPaint.setStrokeWidth(2.5f);
             }
         
             @Override
             protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
                 super.onMeasure(widthMeasureSpec, heightMeasureSpec);
                 // 为了支持wrap_content, 在onMeasure中指定一个默认的宽和高，在设置wrap_content时设置该默认的宽和高
                 // 注意setMeasuredDimension()接受的参数单位时px。
                 int widthSpecMode = MeasureSpec.getMode(widthMeasureSpec);
                 int heightSpecMode = MeasureSpec.getMode(heightMeasureSpec);
                 int widthSpecSize = MeasureSpec.getSize(widthMeasureSpec);
                 int heightSpecSize = MeasureSpec.getSize(heightMeasureSpec);
         
                 if (widthSpecMode == MeasureSpec.AT_MOST && heightSpecMode == MeasureSpec.AT_MOST) {
                     setMeasuredDimension(600, 600);
                 } else if (widthSpecMode == MeasureSpec.AT_MOST) {
                     setMeasuredDimension(600, heightSpecSize);
                 } else if (heightSpecMode == MeasureSpec.AT_MOST) {
                     setMeasuredDimension(widthSpecSize, 600);
                 }
             }
         
             @Override
             protected void onDraw(Canvas canvas) {
                 super.onDraw(canvas);
                 //支持padding
                 int paddingLeft = getPaddingLeft();
                 int paddingRight = getPaddingRight();
                 int paddingTop = getPaddingTop();
                 int paddingBottom = getPaddingBottom();
         
                 int width = getWidth() - paddingLeft - paddingRight;
                 int height = getHeight() - paddingTop - paddingBottom;
                 canvas.drawRect(0 + paddingLeft, 0 + paddingTop, width + paddingRight,
                         height + paddingBottom, mPaint);
         
             }
         }
         
         ```

      2. attrs.xml

         ```xml
         <?xml version="1.0" encoding="utf-8"?>
         <resources>
             <declare-styleable name="RectView">
                 <attr name="rect_color" format="color"/>
             </declare-styleable>
         </resources>
         ```

   3. 自定义组合控件

      主要解决多次重复地使用同一类型的布局，如顶部标题栏和弹出固定样式的dialog

      例如顶部标题栏：

      1. layout

         ```xml
         <?xml version="1.0" encoding="utf-8"?>
         <androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
             xmlns:app="http://schemas.android.com/apk/res-auto"
             xmlns:tools="http://schemas.android.com/tools"
             android:layout_width="match_parent"
             android:layout_height="wrap_content"
             android:background="#E5424B">
         
             <TextView
                 android:id="@+id/tv_title"
                 android:layout_width="wrap_content"
                 android:layout_height="wrap_content"
                 android:text="TextView"
                 android:textSize="30sp"
                 app:layout_constraintBottom_toBottomOf="parent"
                 app:layout_constraintEnd_toStartOf="@+id/btn_check"
                 app:layout_constraintHorizontal_bias="0.5"
                 app:layout_constraintStart_toEndOf="@+id/btn_back"
                 app:layout_constraintTop_toTopOf="parent" />
         
             <ImageView
                 android:id="@+id/btn_back"
                 android:layout_width="wrap_content"
                 android:layout_height="wrap_content"
                 app:layout_constraintBottom_toBottomOf="parent"
                 app:layout_constraintStart_toStartOf="parent"
                 app:layout_constraintTop_toTopOf="parent"
                 app:srcCompat="@drawable/ic_baseline_arrow_back_24" />
         
             <ImageView
                 android:id="@+id/btn_check"
                 android:layout_width="wrap_content"
                 android:layout_height="wrap_content"
                 app:layout_constraintBottom_toBottomOf="parent"
                 app:layout_constraintEnd_toEndOf="parent"
                 app:layout_constraintTop_toTopOf="parent"
                 app:srcCompat="@drawable/ic_baseline_check_24" />
         </androidx.constraintlayout.widget.ConstraintLayout>
         ```

      2. java

         ```java
         public class TitleBar extends ConstraintLayout {
         
             private ImageView backImageView;
             private ImageView checkImageView;
             private TextView titleTextView;
         
             public TitleBar(@NonNull Context context) {
                 super(context);
                 initView(context);
             }
         
             public TitleBar(@NonNull Context context, @Nullable AttributeSet attrs) {
                 super(context, attrs);
                 initView(context);
             }
         
             public TitleBar(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
                 super(context, attrs, defStyleAttr);
                 initView(context);
             }
         
             private void initView(Context context)  {
                 //加载TitleBar布局
                 LayoutInflater.from(context).inflate(R.layout.view_custom_title, this, true);
                 backImageView = findViewById(R.id.btn_back);
                 checkImageView = findViewById(R.id.btn_check);
                 titleTextView = findViewById(R.id.tv_title);
             }
         
             /**
              * 设置标题
              * @param title 标题
              */
             public void setTitle(String title) {
                 if (!title.isEmpty()) {
                     titleTextView.setText(title);
                 }
             }
         
             /**
              * 设置左边图标的点击事件
              * @param onClickListener 回调函数
              */
             public void setLeftIconListener(OnClickListener onClickListener) {
                 backImageView.setOnClickListener(onClickListener);
             }
         
             /**
              * 设置右边图标的点击事件
              * @param onClickListener 回调函数
              */
             public void setRightIconListener(OnClickListener onClickListener) {
                 checkImageView.setOnClickListener(onClickListener);
             }
         }
         ```

      3. 调用

         ```java
         protected void onCreate(Bundle savedInstanceState) {
             super.onCreate(savedInstanceState);
             setContentView(R.layout.activity_main);
         
             TitleBar titleBar = findViewById(R.id.title_bar);
             titleBar.setTitle("标题");
             titleBar.setLeftIconListener(v -> {
                 Toast.makeText(this, "click left", Toast.LENGTH_SHORT).show();
             });
             titleBar.setRightIconListener(v -> {
                 Toast.makeText(this, "click right", Toast.LENGTH_SHORT).show();
             });
         }
         ```

   4. 自定义ViewGroup

      实现简化版的ViewPager，左右滑动切换页面。

## 4. 多线程编程

1. 进程与线程

   - 进程：看作是程序的实体，操作系统管理的基本单元，是线程的容器
   - 线程：操作系统调度的最小单元，线程都有各自的计数器、堆栈、局部变量，并且能访问共享的内存变量

2. 线程状态

   1. New：新创建状态。还没有调用start方法，在线程运行之前还有一些基础工作要做
   2. Runnable：可运行状态。一旦调用start方法，线程就处于Runnable状态。一个可运行的线程可能正在运行也可能没有运行，取决于操作系统给线程提供运行的时间。
   3. Blocked：阻塞状态。表示线程被锁阻塞，暂时不活动。
   4. Waiting：等待状态。线程暂时不活动，且不运行任何代码，浙消耗最少的资源，直到线程调度器重新激活他。
   5. Timed waiting：超时等待状态。和等待状态不同，他可以在指定的时间自行返回
   6. Terminated：终止状态。表示当前线程已经执行完毕。有两种情况：第一种run方法执行完毕正常退出，第二种因为一个没有捕获的异常终止了run方法。

   <img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/%E7%BA%BF%E7%A8%8B%E7%8A%B6%E6%80%81%E5%9B%BE.png" style="zoom: 67%;" />

   **注意：调用start方法后不是立即执行多线程代码，而是变成可执行状态，具体什么时候开始执行由操作系统决定**

3. 创建线程（推荐方法2）

   1. 继承Thread类，重写run()方法

      - 定义Thread的子类，并重写run方法，该方法的方法体就代表了线程要完成的任务
      - 创建Thread子类的实例
      - 调用线程对象的start方法启动该线程

      ```java
      public class MyThread extend Thread {
          @Override
          public void run() {
              System.out.println("hello");
          }    
          public static void main(String[] args) {
              MyThread myThread = new MyThread();
              myThread.start();
          }
      }
      ```

   2. 实现Runnable接口，并实现该接口的run方法

      - 自定义类并实现Runnable接口，实现run方法
      - 创建Thread的实例，并用实现Runnable接口的对象作为参数实例化该对象
      - 调用Thread的start方法启动该线程

      ```java
      public class TestRunnable implements Runnable {
          public void run() {
              System.out.println("hello");
          }
      }
      public class Test {
          public static void main(String[] args) {
              TestRunnable runnable = new TestRunnable();
              Thread thread = new Thread(runnable);
              thread.start();
          }
      }
      ```

   3. 实现Callable接口，重写call方法

      Callable接口时Executor框架中的功能类，提供了比Runable接口更强大的功能。

      - Callable可以在任务结束后提供一个返回值
      - call方法可以抛出异常
      - 运行Callable可以拿到一个Future对象，表示异步计算的结果(1中的返回值)，调用Future的get方法以获得结果时，当前线程就会阻塞，直到call方法返回结果

      ```java
      public class TestCallable {
          public static class MyTestCallable implements Callable {
              public String call() throws Exception {
                  return "hello";
              }
          }
          public static void main(String[] args) {
              MyTestCallable mMyTestCallable = new MyTestCallable();
              ExecutorService mExecutorService = ExecutorService.newSingleThreadPool();
              Future mFuture = mExecutorService.submit(mMyTestCallable);
              try {
                  System.out.println(mFuture.get());
              } catch(Exception e) {
                  e.printStackTrace();
              }
          }
      }
      ```

4. 同步

   1. 重入锁与条件对象

      重入锁（ReentrantLock）：支持重新进入的锁，能够支持一个线程对资源的重复加锁

      ```java
      // 用重入锁保护代码块的结构
      Lock mLock = new ReentrantLock();
      mLock.lock();
      try {
          //...
      } finally {
          mLock.unlock();
      }
      ```

      保证任何一个时刻只有一个线程进入临界区。

      线程进入临界区时，发现在某一个条件满足时，他才能执行，这时可以用一个条件对象（条件变量）来管理那些已经获得了一个锁却不能做有效工作的线程。

      ```java
      // 如果没有条件对象，会发生什么
      public class AliPay {
          private double[] accounts;
          Lock mLock;
          public AliPay(int n, double money) {
              mLock = ReentrantLock();
              accounts = new double[n];
              for(int i = 0; i < n; i++) {
                  accounts[i] = money;
              }
          }
          
          public void transfer(int from, int to, int amount) {
           	mLock.lock();
              try{
                  while(account[from] < amount) {
                      // wait
                      // 这里会发生死锁，当前线程加锁，但是转账条件不满足，其他线程又不能获得锁
                  }
                  account[from] -= amount;
                  account[to] += amount;           
              } finally {
                  mLock.unlock();
              }
          }
          
      }
      ```

      ```java
      // 引入条件对象
      // 如果没有条件对象，会发生什么
      public class AliPay {
          private double[] accounts;
          Lock mLock;
          Condition mCondition;
          public AliPay(int n, double money) {
              mLock = ReentrantLock();
              mCondition = mLock.newCondition();
              accounts = new double[n];
              for(int i = 0; i < n; i++) {
                  accounts[i] = money;
              }
          }
          
          public void transfer(int from, int to, int amount) {
           	mLock.lock();
              try{
                  while(account[from] < amount) {
                      mCondition.await();	// 加入等待集
                  }
                  account[from] -= amount;
                  account[to] += amount; 
                  mCondition.signalAll();
              } finally {
                  mLock.unlock();	// 解除线程阻塞状态
              }
          }
          
      }
      ```

      signalAll并不是立即激活一个等待进程，仅仅接触了等待线程的阻塞，以便这些线程能够在当前线程退出同步方法后，通过竞争实现对对象的访问。

   2. 同步方法

      java中每个对象都有一个内部锁，如果一个方法用synchronized关键字声明，那么对象的锁将保护整个方法

      ```java
      public synchronized void method() {
          //...
      }
      // 等价于
      Lock mLock = new ReentrantLock()
      public void method2() {
          mLock.lock();
      	try {
              //...
          } finally {
              mLock.unlock();
          }
      }
      ```

      ```java
      // 所以上面的转账方法也可以这样写
      public synchronized void transfer(int from, int to, int amount) {
          while (account[from] < amount) {
              await();	// 等价于mCondition.await() // 加入等待集
          }
          account[from] -= amount;
          account[to] += amount; 
          notifyAll();	// 等价于mCondition.signalAll(); // 解除线程阻塞状态
      }
      ```

   3. volatile

      有时为了读写一两个实例域就使用同步，开销过大，volatile关键字为实例域的同步访问提供免锁机制。

      声明一个变量为volatile，编译器和虚拟机就知道该变量可能会被另一个线程并发更新的

      1. java内存模型

         堆内存中的数据可以被线程共享，每个线程对共享的变量还有一个私有的本地内存，存储了共享变量的副本。

         <img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/java%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B.jpg" style="zoom:50%;" />

         线程A与B通信：

         - A把A本地内存中更新过的变量刷新到主内存中
         - B去主内存中读取更新过的变量

      2. 原子性、可见性、有序性

         - 原子性：操作不能中断，要么执行完毕，要么不执行，且两个原子性合并起来不是原子性。如```y = x```。
         - 可见性：一个线程修改的的结果，另一个线程马上能看到。普通变量被线程修改后，不能马上被写入主存，其他线程读取时，可能还是旧值。
         - 有序性：编译器可能对指令重排序。

      3. volatile关键字

         - 保证可见性，一个线程修改的值会被立即写入主存

         - 不保证原子性，直接对变量赋立即数可以，但是涉及自增，不保证。

           自增的三个操作：读取变量的原始值，进行加1，写入工作内存，三个操作可能分裂执行。

           例如inc = 9，线程1对变量自增，读取后被阻塞，线程2对变量自增，把10写入工作内存，这时线程1恢复操作，由于读取的是旧值9，自增后为10，写入工作内存，最后导致自增两次，结果为10。

         - 保证有序性

      4. 正确使用volatile

         具备以下条件

         - 对该变量的写操作不会依赖于当前值
         - 改变量没有包含在具有其他变量的不变式中

      5. volatile常见的两个场景

         - 状态标志

           ```java
           private volatile boolean shouldDownRequest;
           public void shutdown() {
               shouldDownRequest = true;
           }
           public void doWork() {
               while(!shouldDownRequest) {
                   //...
               }
           }
           ```

         - 双重检查模式（DCL）

           ```java
           // 进行两次判空，第一次为了避免不必要的同步，第二次只有在instance为null的情况下才创建实例
           public class Singleton {
               private volatile static Singleton instance = null;
               public static Singleton getInstance() {
                   if (instance == null) {
                       synchronized (this) {
                           if (instance == null) {
                               instance = new Singleton();
                           }
                       }
                   }
                   return instance;
               }
           }
           ```

   4. 阻塞队列

      ```java
      // 实现生产者、消费者
      package 生产者消费者;
      
      import java.util.ArrayDeque;
      import java.util.Queue;
      
      /**
       * 不使用阻塞队列，使用同步
       */
      public class ProducerAndCustomer {
      
          private static final int QUEUE_SIZE = 10;
          private Queue<Integer> queue = new ArrayDeque<>();
      
          public static void main(String[] args) {
              ProducerAndCustomer producerAndCustomer = new ProducerAndCustomer();
              Producer producer = producerAndCustomer.new Producer();
              Customer customer = producerAndCustomer.new Customer();
      
              producer.start();
              customer.start();
          }
      
          class Producer extends Thread {
              @Override
              public void run() {
                  super.run();
                  while (true) {
                      synchronized (queue) {
                          while (queue.size() == QUEUE_SIZE) {
                              try {
                                  System.out.println("队列满...");
                                  queue.wait();
                              } catch (InterruptedException e) {
                                  e.printStackTrace();
                                  queue.notify();
                              }
                          }
                          queue.offer(1);
                          queue.notify();
                      }
                  }
      
              }
          }
      
          class Customer extends Thread {
              @Override
              public void run() {
                  super.run();
                  while (true) {
                      synchronized (queue) {
                          while (queue.size() == 0) {
                              try {
                                  System.out.println("队列空..");
                                  queue.wait();
                              } catch (InterruptedException e) {
                                  e.printStackTrace();
                                  queue.notify();
                              }
                          }
                          queue.poll();
                          queue.notify();
                      }
                  }
              }
          }
      }
      
      ```

      ```java
      // 实现生产者消费者，使用阻塞队列
      package 生产者消费者;
      
      import java.util.concurrent.ArrayBlockingQueue;
      
      public class ProducerAndCustomer2 {
          private static final int MAX_SIZE = 10;
          private ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(MAX_SIZE);
      
          public static void main(String[] args) {
              ProducerAndCustomer2 producerAndCustomer2 = new ProducerAndCustomer2();
              Producer producer = producerAndCustomer2.new Producer();
              Customer customer = producerAndCustomer2.new Customer();
              producer.start();
              customer.start();
          }
      
          class Producer extends Thread {
              @Override
              public void run() {
                  super.run();
                  while (true) {
                      try {
                          queue.put(1);	//put方法会等待
                      } catch (InterruptedException e) {
                          e.printStackTrace();
                      }
                  }
              }
          }
      
          class Customer extends Thread {
              @Override
              public void run() {
                  super.run();
                  while (true) {
                      try {
                          queue.take();	// take方法会等待
                      } catch (InterruptedException e) {
                          e.printStackTrace();
                      }
                  }
              }
          }
      }
      
      ```

   5. 线程池

      每个线程的创建和销毁都需要一定的开销，且每个线程都是“各自为政”，需要线程池对线程进行管理。

      Executor框架用于把任务的提交和执行解耦，任务的提交给Runnable或者Callable，而Executor框架用来处理任务

   6. AsyncTask

## 5. 设计模式

1. 设计模式六大原则

   - 单一职责原则

     就一个类而言，应该只有一个引起他变化的原因。比如在Activity中Bean、网络请求、adapter同时存在

   - 开放封闭原则

     类、模块、函数等应该是可以扩展的，但是不可修改，即对于扩展是开放的，对于修改是封闭的。

     有新需求时尽量可以通过扩展原有代码的方式来实现。

   - 里氏替换原则

     所有引用基类的地方必须能够透明的使用其子类的对象。

   - 依赖倒置原则

     高层模块不应该依赖底层模块，两者都应依赖于抽象。抽象不应该依赖于细节，细节应该依赖于抽象。

   - 迪米特原则

     一个软件实体应当尽可能少地与其他实体发生相互作用。

   - 接口隔离原则

     一个类对另一个类的依赖应该建立在最小的接口上

2. 设计模式分类

   - 创建型模式
   - 结构型模式
   - 行为型模式

3. 创建型模式

   1. 单例模式

      保证一个类只有一个实例，并提供一个访问它的全局节点。

      六种写法：

      ```java
      // 1. 饿汉模式
      // 在类加载时就完成了初始化，所以类加载较慢，但是获取对象的速度快，可以避免多线程的同步问题，
      // 如果从未使用过这个实例，则会造成内存的浪费
      public class Singleton {
          private static Singleton instance = new Singleton();
          private Singleton() {}
          public Singleton getInstance() {
              return instance;
          }
      }
      
      // 2. 懒汉模式(线程不安全)
      public class Singleton {
          private static Singleton instance;
          private Singleton() {}
          public static Singleton getInstance() {
              if (instance == null) {
                  instance = new Singleton();
              }
              return instance;
          }
      }
      
      // 3. 懒汉模式(线程安全)
      // 每次调用getInstance方法都要进行同步，造成不必要的同步开销。
      public class Singleton {
          private static Singleton instance;
          private Singleton() {}
          public static synchronized Singleton getInstance() {
              if (instance == null) {
                  instance = new Singleton();
              }
              return instance;
          }
      }
      
      // 4. 双重检查机制(DCL Double Check Lock)
      // 某些情况也会出现失效的问题，也就是DCL失效
      public class Singleton {
          private volatile static Singleton instance;
          private Singleton() {}
          public static Singleton getInstance() {
              if (instance == null) {
                  synchronized (Singleton.class) {
                      if (instance == null) {
                          instance = new Singleton();
                      }
                  }
              }
              return instance;
          }
      }
      
      // 5. 静态内部类单例模式
      // 推荐
      public class Singleton {
      	private Singleton() {}
          
          public static Singleton getInstance() {
              SingletonHolder.sInstance;
          }
          
          private static class SingletonHolder() {
              private static final Singleton sInstance = new Singleton();
          }
      }
      
      // 6. 枚举单例
      public enum Singleton {
          INSTANCE;
          public void doSomething() {
              //...
          }
      }
      ```

      使用场景：

      - 整个项目需要一个共享访问点
      - 创建一个对象需要耗费的资源过多，比如访问I/0或者数据库等资源
      - 工具类对象

   2. 工厂模式

4. 行为型设计模式

   1. 观察者模式

      ```java
      // 1. 抽象观察者
      public interface Obsercer {
          public void update(String message);
      }
      
      // 2. 具体观察者
      public class WeixinUser implements Observer {
          @Override
          public void update(String message) {
              // .. 事件改变后通知给具体的微信user，做出响应
              System.out.println(message)
          }
      }
      
      // 3. 抽象被观察者
      public interface Subject {
          // 增加订阅者
          public void attach(Observer observer);
          
          // 删除订阅者
          public void deattch(Observer observer);
          
          // 通知订阅者
          public void notify(String message);
      }
      
      // 4. 具体观察者
      public class SubscrptionSubject implements Subject {
          
          List<Observer> observers = new ArrayList<>();
          // 增加订阅者
          public void attach(Observer observer) {
              observers.add(observer);
          }
          // 删除订阅者
          public void deattch(Observer observer) {
              observers.remove(observer);
          }
          // 通知订阅者
          public void notify(String message) {
           	for (Observer observer : observers) {
                  observer.notify(message);
              }
          }
      }
      
      // 5. 客户端调用
      public class Client {
          
          public static void main(String[] args) {
              SubscrptionSubject subscrptionSubject = new SubscrptionSubject();
              
              subscrptionSubject.attach(new WeixinUser());
              subscrptionSubject.attach(new WeixinUser());
              subscrptionSubject.attach(new WeixinUser());
              
              subscrptionSubject.notify("changed");
              
          }
      }
      ```


## 6. 事件总线

为了简化并且高质量的在Activity、Fragment、Thread、Service等之间的通信

1. 使用EventBus

   EventBus的三要素：

   - Event：事件，可以是任意类型的对象
   - Subscriber：事件订阅者，消息处理的方法需要加@Subscriber注解，指定线程模型
   - Publisher：事件发布者，可以在线程任意位置发送事件，直接调用EventBus的post方法，一般使用```EventBus.getDefault()```实例化对象

   EventBus的四种线程模型

   - POSTING(默认)：事件从哪个线程发出来，事件处理函数就在哪个线程执行。该事件处理函数尽量避免耗时操作，会阻塞事件的传递，甚至引起ANR
   - MAIN：事件的处理在UI线程，同样避免耗时操作
   - BACKGROUND：若事件在UI线程发布，事件处理函数在新线程执行，若在子线程发布，事件处理函数直接在发布线程中执行
   - ASYNC：无论事件在哪个线程发布，事件处理函数都在新子线程中执行

2. 基本用法

   ```java
   // 1. 自定义一个事件类
   public class MessageEvent {
       //...
   }
   
   // 2. 在需要订阅事件的地方注册事件
   EventBus.getDefault().register(this);
   
   // 3. 发送事件
   EventBus.getDefault().post(messageEvent);
   
   // 4. 处理事件
   @Subscribe(threadMode = ThreadMode.MAIN)
   public void doWork(Message message) {
       //...
   }
   
   // 5.取消订阅事件
   EventBus.getDefault().unregister(this);
   ```

## 7. 函数响应式编程

1. 定义

   函数式编程是面向数学的抽象，将计算描述为一种表达式求值，函数可以在任何地方定义，并且可以对函数进行组合

   响应式编程是一种面向数据流和变化传播的编程范式，数据更新是相关的。

2. RxJava框架

## 8. 应用架构设计

1. MVC模式

   Model-View-Controller（模型-视图-控制器），android中MVC的角色定义如下

   - 模型层（Model）：我们针对业务模型，建立的数据结构和相关的类，就可以理解为Model，与View无关，而与业务有关
   - 视图层（View）：一般采用XML文件或者Java代码进行界面的描述，也可以使用JS+HTML等方式作为View层。
   - 控制层（Controller）：Android的控制层通常在Activity、Fragment或者由他们控制的其他业务类中。

   <img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/mvc.jpg" style="zoom:80%;" />

   简单来说就是通过Controller来操作Model层的数据，并且返回给View层展示。

   但是android中的Activity不是标准的Controller，他的首要职责是加载应用的布局和初始化用户界面，接受并处理来自用户的操作请求，进而做出响应。

2. MVP模式

   Model-View-Presenter，是MVC的演化版本

   - Model：主要提供数据的存储功能，Presenter需要通过Model来存储、获取数据
   - View：负责处理用户事件和视图部分的展示，在Android中，他可以是Activity、Fragment、或者是某个View控件
   - Presenter：作为View和Model之间沟通的桥梁，他从Model层检索数据后返回给View层，使得View和Model之间没有耦合

   <img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/mvp.jpg" style="zoom: 33%;" />

   Presenter将View和Model进行完全分离，主要的逻辑在Presenter中实现，并且Presenter和具体的View是没有关联的，而是通过定义好的接口进行交互，从而使得变更View时可以保持Presenter的不变，符合面向接口编程的特点。View应该只有简单的Set/Get方法，以及用户输入和设计界面展示的内容，除此之外就不应该有更多的内容。**决不允许View直接访问Model**。

   示例：

   ```java
   //MvpCallBack接口
   public interface MvpCallback {
      /**
        * 数据请求成功
        * @param data 请求到的数据
        */
       void onSuccess(String data);
       /**
        *  使用网络API接口请求方式时，虽然已经请求成功但是由
        *  于{@code msg}的原因无法正常返回数据。
        */
       void onFailure(String msg);
        /**
        * 请求数据失败，指在请求网络API接口请求方式时，出现无法联网、
        * 缺少权限，内存泄露等原因导致无法连接到请求数据源。
        */
       void onError();
       /**
        * 当请求数据结束时，无论请求结果是成功，失败或是抛出异常都会执行此方法给用户做处理，通常做网络
        * 请求时可以在此处隐藏“正在加载”的等待控件
        */
       void onComplete();
   }
   ```

   ```JAVA
   //Model类
   public class MvpModel {
       /**
        * 获取网络接口数据
        * @param param 请求参数
        * @param callback 数据回调接口
        */
       public static void getNetData(final String param, final MvpCallback callback){
           // 利用postDelayed方法模拟网络请求数据的耗时操作
           new Handler().postDelayed(new Runnable() {
               @Override
               public void run() {
                   switch (param){
                       case "normal":
                           callback.onSuccess("根据参数"+param+"的请求网络数据成功");
                           break;
                       case "failure":
                           callback.onFailure("请求失败：参数有误");
                           break;
                       case "error":
                           callback.onError();
                           break;
                   }
                   callback.onComplete();
               }
           },2000);
       }
   }
   ```

   ```java
   //View接口
   public interface MvpView {
       /**
        * 显示正在加载进度框
        */
       void showLoading();
       /**
        * 隐藏正在加载进度框
        */
       void hideLoading();
       /**
        * 当数据请求成功后，调用此接口显示数据
        * @param data 数据源
        */
       void showData(String data);
       /**
        * 当数据请求失败后，调用此接口提示
        * @param msg 失败原因
        */
       void showFailureMessage(String msg);
       /**
        * 当数据请求异常，调用此接口提示
        */
       void showErrorMessage();
   }
   ```

   ```java
   //Presenter类
   public class MvpPresenter {
       // View接口
       private MvpView mView;
       // 注入view
       public MvpPresenter(MvpView view){
           this.mView = view;
       }
       /**
        * 获取网络数据
        * @param params 参数
        */
       public void getData(String params){
           //显示正在加载进度条
           mView.showLoading();
           // 调用Model请求数据
           MvpModel.getNetData(params, new MvpCallback() {
               @Override
               public void onSuccess(String data) {
                   //调用view接口显示数据
                   mView.showData(data);
               }
               @Override
               public void onFailure(String msg) {
                   //调用view接口提示失败信息
                   mView.showFailureMessage(msg);
               }
               @Override
               public void onError() {
                   //调用view接口提示请求异常
                   mView.showErrorMessage();
               }
               @Override
               public void onComplete() {
                   // 隐藏正在加载进度条
                   mView.hideLoading();
               }
           });
       }
   }
   ```

   ```java
   //Actiity类
   public class MainActivity extends AppCompatActivity implements MvpView  {
       //进度条
       ProgressDialog progressDialog;
       TextView text;
       MvpPresenter presenter;
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
           text = (TextView)findViewById(R.id.text);
           // 初始化进度条
           progressDialog = new ProgressDialog(this);
           progressDialog.setCancelable(false);
           progressDialog.setMessage("正在加载数据");
           //初始化Presenter
           presenter = new MvpPresenter(this);
       }
       // button 点击事件调用方法
       public void getData(View view){
           presenter.getData("normal");
       }
       // button 点击事件调用方法
       public void getDataForFailure(View view){
           presenter.getData("failure");
       }
       // button 点击事件调用方法
       public void getDataForError(View view){
           presenter.getData("error");
       }
       @Override
       public void showLoading() {
           if (!progressDialog.isShowing()) {
               progressDialog.show();
           }
       }
       @Override
       public void hideLoading() {
           if (progressDialog.isShowing()) {
               progressDialog.dismiss();
           }
       }
       @Override
       public void showData(String data) {
           text.setText(data);
       }
       @Override
       public void showFailureMessage(String msg) {
           Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
           text.setText(msg);
       }
       @Override
       public void showErrorMessage() {
           Toast.makeText(this, "网络请求数据出现异常", Toast.LENGTH_SHORT).show();
           text.setText("网络请求数据出现异常");
       }
   }
   ```






## 9. 四大组件的工作过程

### 四大组件的运行状态

除了BroadcastReciver以外，其他三种组件都必须在AndroidManifest中注册，BroadcastReciver既可以在AndroidManifest中注册，也可以通过代码注册。

在调用方式上，Acitivity、Service、BroadcastReceiver需要借助intent，ContentProvider不用。

Activity是一种展示型组件，启动有显示intent和隐式intent，一个activity可以有特定的启动模式，可以调用```finish()```来终止。

Service是一种计算型组件，Service有两种状态：**启动态**和**绑定态**。位于启动态时，内部可以做后台计算，且不需要和外部有直接的交互。位于绑定态时，内部同样可以进行后台计算，但这种状态下外部可以方便的和Service组件进行通信。

BroadcastReceiver是一种消息型组件，在不同的组件甚至不同应用之间传递消息。无法被用户直接感知。两种注册方式：***静态注册***和***动态注册***。静态注册在AndroidManifest中注册，安装时被系统解析，不需要启动应用就可以注册并接受广播。动态注册通过```Context.registerReceiver()```来实现，在不需要时通过```Context.unregisterReceiver()```来实现。必须启动应用才能接受广播。发送和接受的过程的匹配是通过广播接收者的```<intent-filter>```来描述的，该组件可以用来实现低耦合的观察者模式，他不适合用来执行耗时操作，没有停止的概念。

ContentProvider是一种数据共享型组件，用于向其他组件乃至其他应用共享数据。无法被用户感知，内部需要实现增删改查操作，并且要处理好线程同步，也不需要手动停止。

### Activity的工作过程

```java
Intent intent = new Intent(this, SecondActivity.class);
startActivity(intent);
```

startActivity最终会调用```startActivityForResult```方法。

### Service的工作过程

```java
// 启动状态
Intent intent = new Intent(this, MyService.class);
startService(intent);

// 绑定状态
Intent intent = new Intent(this, Myservice.class);
bindService(this);
```

生命周期：onCteate - onStartCommond - onDestory ;

生命周期：onCreate - onBind - unBind - onDestory;

绑定状态下activity结束，service就结束



### BroadcastReceiver的工作过程

1. 发送广播：

   需要intent，sendBroadcast(intent)

2. 接收广播

   1. 静态注册

      AndroidManifest中注册

   2. 动态注册

      代码中registerReceiver

### ContentProvider的工作过程

## 10. Android的消息机制

Android的消息机制是指Handler的运行机制，Handler的运行需要底层的MessageQueue和Looper的支撑。

MessageQueue是消息队列，但内部使用单链表实现。

Looper为消息循环，由于MessageQueue只是一个消息的存储单元，他不能处理消息，而Looper填补了这个功能。Looper会以无限循环的形式去查找有没有新消息，有则处理。

Looper中还有一个ThreadLocal，可以在每个线程中存储数据。Handler创建的时候会采用当前线程的Looper来构造循环系统，Handler内部通过ThreadLocal来获取每个线程的Looper。ThreadLocal可以在不同线程中互不干扰的存取数据。

线程默认是没有Looper的，如果使用Handler必须创建Looper，但是UI线程有Looper。

**为什么不能在子线程中访问UI？**

​	因为AndroidUI控件是线程不安全的，并发访问可能不安全。为何不加锁？

- 加锁会让UI访问的逻辑变得复杂
- 加锁会降低UI访问的效率

当调用Handler的send方法时，他会调用MessageQueue将消息放入消息队列中，Looper发现有消息到来时就处理。

<img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/handler.png" style="zoom: 33%;" />

1. ThreadLocal的工作原理

   ThreadLocal是一个线程内部的数据存储类，通过它可以在指定的线程中存储数据，数据存储后，只有在指定的线程中可以获取到存储的数据，其他线程无法获取到。

   ```java
   private ThreadLocal<Boolean> mThreadLocal = new ThreadLocal<>();
   mThreadLocal.set(true);
   Log.d(TAG, mThreadLocal.get());
   
   new Thread("Thread_1") {
       @Override
       public void run() {
           mThreadLocal.set(false);
           Log.d(TAG, mThreadLocal.get());
       }
   }
   new Thread("Thread_2") {
       @Override
       public void run() {
           Log.d(TAG, mThreadLocal.get());
       }
   }
   
   // 对于三次打印
   // 1-------true
   // 2-------false
   // 3-------null
   ```

   不同线程访问同一个ThreadLocal对象，获取的值却不同。因为对于get方法，ThreadLocal会从线程内部取出一个数组，然后再从数组中根据当前ThreadLocal的索引去找对应的value，显然不同线程的数组是不同的。

2. MessageQueue的工作原理

   主要包含两个操作，插入和读取，读取本身会伴随删除操作（队列）。插入：enqueueMessage。读取：next。单链表在插入和删除上比较有优势。

   插入就是单链表的插入，删除是一个无限循环。

3. Looper的工作原理

   Looper不停的从MessageQueue中查看是否有新消息，有则立即取出处理，否则一直阻塞。

   ```java
   // 构造方法中会创建一个MessageQueue
   public Looper(boolean quitAllowed) {
   	mQueue = new MessageQueue(quitAllowed);
       mThread = Thread.currentThread();
   }
   ```

   handler工作需要Looper，而子线程中没有Looper，如何创建？

   ```java
   new Thread() {
   	@Override
       public void run() {
           Looper.prepare();
           Handler handler = new Handler();
           Looper.loop();
       }
   }
   // 只有调用loop后，消息循环系统才真正的起作用。
   ```

4. Handler的工作原理

   handler通过post或者send一系列方法发送消息，而post又是调用send。handler发消息过程仅仅向消息队列中插入一条消息，Looper会取出消息开始处理，最终会交给Handler，Handler的dispatchMessage方法会被调用，Handler进入消息处理阶段，调用callback处理消息。

5. 内存泄漏

   ```java
   Handler handler = new Handler() {
       @Override
       public void handleMessage(Message msg) {
   		super.handleMessage(msg);
       }
   } 
   ```

   java 中非静态内部类和匿名类都会持有外部类的隐式引用，如果Handler没有被释放，其所持有的外部引用也就是Activity也不可能被释放。

   使用静态内部类，Handler中增加一个对Activity的弱引用。同时如果post Runnable，Runnable也要静态





## 11. 图片

1. 图片三级缓存

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/%E5%9B%BE%E7%89%87%E4%B8%89%E7%BA%A7%E7%BC%93%E5%AD%98.png)

   1. 内存LruCache

      最近最少使用算法，将最近使用的对象通过强引用添加到LinkedHashMap中，将最远最少使用的对象在达到缓存最大值之前剔除

      LinkedHashMap存取值都会将元素放到尾，剔除时剔除头

   2. 文件缓存DiskLruCache

      将图片Url转换为key，一般将url的md5值转换为key。

   3. 网络加载

      将图片保存到内存和文件系统

2. Glide

   1. 使用图片缓存功能

      ```java
      Glide.with(this)
          .load("http://example.com")
          .skipMemoryCache(true)
          .diskCacheStrategy(DiskCacheStrategy.NONE)
          .into(imageView)
      // 有4种图片缓存模式
      // DiskCacheStrategy.NONE：表示不缓存任何内容。
      // DiskCacheStrategy.SOURCE：表示只缓存原始图片。
      // DiskCacheStrategy.RESULT：表示只缓存转换过后的图片（默认选项）。
      // DiskCacheStrategy.ALL ：表示既缓存原始图片，也缓存转换过后的图片。
      ```

   2. 缓存设计思路

      内存缓存使用弱引用和LruCache结合，弱引用用来缓存正在使用的图片，内部有一个计数器来记录图片是否被使用。

   3. 内存缓存

      读：先从LruCache中读，读不到在弱引用中取

      写：当内存中读不到时，从网络中下载回来先放到弱引用中，Resources计数器加1，渲染完成时，计数器减1。当计数器为0时，图片从弱引用中删除，放入LruCache缓存

   4. 文件缓存

      读：先找处理后的图片，找不到再找原图。

      写：先写原图，再写处理后的图片。

## 自定义视图

1. 包括

   - 绘图

      - 画布(Canvs)
      - 画笔(Paint)

   - 交互

      - 触摸(TouchEvent)
      - 动画(Animation)

   - 性能

      - onDraw()

        考虑主线程安全

      - SuraceView()

        副线程绘图

   - 封装

      - 尺寸(measure)
      - 属性(attributes)

2. 自定义editText

   未绘图

   实现输入框右边带x，当输入框有内容点击后可清除文本

   ```java
   public class EditTextWithClear extends androidx.appcompat.widget.AppCompatEditText {
       private Drawable iconDrawable = null;
   
       public EditTextWithClear(@NonNull Context context) {
           super(context);
       }
   
       public EditTextWithClear(@NonNull Context context, @Nullable AttributeSet attrs) {
           super(context, attrs);
   
           TypedArray a = context.getTheme().obtainStyledAttributes(
                   attrs,
                   R.styleable.EditTextWithClear,
                   0, 0);
           try {
               int iconId = a.getResourceId(R.styleable.EditTextWithClear_clearIcon, 0);
               if (iconId != 0) {
                   // 绑定图标
                   iconDrawable = ContextCompat.getDrawable(context, iconId);
               }
           } finally {
               a.recycle();
           }
       }
   
       public EditTextWithClear(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
           super(context, attrs, defStyleAttr);
       }
   
       @Override
       protected void onTextChanged(CharSequence text, int start, int lengthBefore, int lengthAfter) {
           super.onTextChanged(text, start, lengthBefore, lengthAfter);
           toggleClearIcon();
       }
   
       /**
        * 当点击到图标并且手松开后就清除文字
        * @param event MotionEvent
        * @return boolean
        */
       @Override
       public boolean onTouchEvent(MotionEvent event) {
           if (event != null) {
               if (event.getAction() == MotionEvent.ACTION_UP
                       && event.getX() > getWidth() - iconDrawable.getIntrinsicWidth()
                       && event.getX() < getWidth()
                       && event.getY() > (float)getHeight() / 2 - (float)iconDrawable.getIntrinsicHeight() / 2
                       && event.getY() < (float) getHeight() / 2 + (float) iconDrawable.getIntrinsicHeight() / 2
               ) {
                   if (getText()!= null) {
                       getText().clear();
                   }
               }
   
           }
           performClick();
           return super.onTouchEvent(event);
       }
   
       /**
        * 有些设备是没有触摸屏的，只有点击事件
        * @return
        */
       @Override
       public boolean performClick() {
           return super.performClick();
       }
   
       @Override
       protected void onFocusChanged(boolean focused, int direction, Rect previouslyFocusedRect) {
           super.onFocusChanged(focused, direction, previouslyFocusedRect);
           toggleClearIcon();
       }
   
       /**
        * 当输入框中有文本时就在end的位置显示x图标。
        * 并且失去焦点时图标消失
        */
       private void toggleClearIcon() {
           Drawable icon = (isFocused() && getText() != null && !getText().toString().isEmpty()) ? iconDrawable : null;
           // 设置图标的位置：在end的位置
           setCompoundDrawablesRelativeWithIntrinsicBounds(null, null, icon, null);
   
       }
   }
   ```

   在values中新建attrs.xml，可定义控件的一些属性，外部通过属性名调用

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <declare-styleable name="EditTextWithClear">
           <attr name="clearIcon" format="reference" />
       </declare-styleable>
   </resources>
   ```

3. 自定义绘图

   <img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/Screenshot1.jpg" style="zoom: 25%;" />

   ```java
   public class MyView extends View {
   
       private float mWidth = 0f;
       private float mHeight = 0f;
       private float mRadius = 0f;
       // 角度
       private float mAngle = 10f;
   
       private Paint solidLinePaint = null;
       private Paint vectorLinePaint = null;
       private Paint textPaint = null;
       private Paint dashedLinePaint = null;
       private Paint fillCirclePaint = null;   //坐标轴上的圆点
       private Path sinWaveSamplesPaint = null;
   
       private void init() {
           solidLinePaint = new Paint();
           solidLinePaint.setStyle(Paint.Style.STROKE);
           solidLinePaint.setStrokeWidth(5f);
           solidLinePaint.setColor(ContextCompat.getColor(getContext(), R.color.white));
   
           vectorLinePaint = new Paint();
           vectorLinePaint.setStyle(Paint.Style.STROKE);
           vectorLinePaint.setStrokeWidth(5f);
           vectorLinePaint.setColor(ContextCompat.getColor(getContext(), R.color.teal_200));
   
           textPaint = new Paint();
           textPaint.setTextSize(40f);
           textPaint.setTypeface(Typeface.DEFAULT_BOLD);
           textPaint.setColor(ContextCompat.getColor(getContext(), R.color.white));
   
           dashedLinePaint = new Paint();
           dashedLinePaint.setStyle(Paint.Style.STROKE);
           solidLinePaint.setStrokeWidth(5f);
           dashedLinePaint.setPathEffect(new DashPathEffect(new float[] {10f, 10f}, 0f));
           dashedLinePaint.setColor(ContextCompat.getColor(getContext(), R.color.yellow));
   
           fillCirclePaint = new Paint();
           fillCirclePaint.setStyle(Paint.Style.FILL);
           fillCirclePaint.setColor(ContextCompat.getColor(getContext(), R.color.white));
   
           sinWaveSamplesPaint = new Path();
   
       }
   
       public MyView(Context context) {
           super(context);
           init();
       }
   
       public MyView(Context context, @Nullable AttributeSet attrs) {
           super(context, attrs);
           init();
       }
   
       public MyView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
           super(context, attrs, defStyleAttr);
           init();
       }
   
       public MyView(Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
           super(context, attrs, defStyleAttr, defStyleRes);
           init();
   
       }
   
       /**
        * 当从xml中加载完后呼叫
        */
       @Override
       protected void onFinishInflate() {
           super.onFinishInflate();
           Log.d("myTag", "onFinishInflate");
       }
   
       @Override
       protected void onAttachedToWindow() {
           super.onAttachedToWindow();
           Log.d("myTag", "onAttachedToWindow");
       }
   
       @Override
       protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
           super.onMeasure(widthMeasureSpec, heightMeasureSpec);
           Log.d("myTag", "onMeasure");
       }
   
       @Override
       protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
           super.onLayout(changed, left, top, right, bottom);
           Log.d("myTag", "onLayout");
       }
   
   
       /**
        * 获取宽高
        * @param w
        * @param h
        * @param oldw
        * @param oldh
        */
       @Override
       protected void onSizeChanged(int w, int h, int oldw, int oldh) {
           super.onSizeChanged(w, h, oldw, oldh);
           Log.d("myTag", "onSizeChanged, w=" + w + ", h=" + h);
   
           this.mWidth = (float) w;
           this.mHeight = (float) h;
   
           // 这里需要判断的原因是不同的屏幕，使其不要出第一条横线，确定最短的半径
           if (w < h / 2) {
               this.mRadius = (float) w / 2;
           } else {
               this.mRadius = (float) h / 4;
           }
       }
   
       @Override
       protected void onDetachedFromWindow() {
           super.onDetachedFromWindow();
           Log.d("myTag", "onDetachedFromWindow");
       }
   
       /**
        * 开始绘图
        * @param canvas
        */
       @Override
       protected void onDraw(Canvas canvas) {
           super.onDraw(canvas);
   //        Log.d("myTag", "onDraw");
           // 画笔对象不要在这里创建，太耗时
           if (canvas != null) {
               drawAxises(canvas);
               drawLabel(canvas);
               drawDashedCircle(canvas);
               drawVector(canvas);
               drawProjections(canvas);
   
               drawSinWave(canvas);
   
               startRotating();
           }
   
       }
   
       /**
        * 画线
        * @param canvas
        */
       private void drawAxises(Canvas canvas) {
           // 画笔方式1：画布不变，画笔按照左上角坐标（0, 0）开始画
           // canvas.drawLine(100f, 100f, 100f, 400f, solidLinePaint);
   
           // 画笔方式2：画笔不变，每次画的时候画布对应位置移到画笔的地方，画完再移回去
           canvas.save();
           canvas.translate(mWidth / 2, mHeight / 2);
           // 画布位置移到中心后，画x起点就是-w/2
           canvas.drawLine(-mWidth / 2,0f, mWidth / 2, 0f, solidLinePaint);
           canvas.drawLine(0f,-mHeight / 2, 0f, mHeight / 2, solidLinePaint);
           canvas.restore();
   
           canvas.save();
           canvas.translate(mWidth / 2, mHeight / 4 * 3);
           canvas.drawLine(-mWidth / 2,0f, mWidth / 2, 0f, solidLinePaint);
           canvas.restore();
       }
   
       /**
        * 画图例
        */
       private void drawLabel(Canvas canvas) {
           canvas.drawRect(100f, 100f, 500f, 240f, solidLinePaint);
           canvas.drawText("指数函数与旋转矢量", 120f, 180f, textPaint);
       }
   
       /**
        * 画虚线圆
        * @param canvas
        */
       private void drawDashedCircle(Canvas canvas) {
           canvas.save();
           canvas.translate(mWidth / 2, mHeight / 4 * 3);
           canvas.drawCircle(0f, 0f, mRadius, dashedLinePaint);
           canvas.restore();
       }
   
       /**
        * 画长度为半径的矢量
        * @param canvas
        */
       private void drawVector(Canvas canvas) {
           canvas.save();
           canvas.translate(mWidth / 2, mHeight / 4 * 3);
           canvas.rotate(-mAngle);
           canvas.drawLine(0f, 0f, mRadius,0f, vectorLinePaint);
           canvas.restore();
       }
   
       private void startRotating() {
           new Thread(() -> {
               try {
                   Thread.sleep(40);
               } catch (InterruptedException e) {
                   e.printStackTrace();
               }
               mAngle += 2;
               invalidate();   //刷新
           }).start();
       }
   
   
       /**
        * 画出投影在坐标轴上的圆点
        * 画出向量在坐标轴上的投影，包括一条实线和一条虚线
        * @param canvas 画布
        */
       private void drawProjections(Canvas canvas) {
           canvas.save();
           canvas.translate(mWidth / 2, mHeight / 2);
           canvas.drawCircle(mRadius * (float)Math.cos(Utils.toRadians(mAngle)), 0f, 20f, fillCirclePaint);
           canvas.restore();
   
           canvas.save();
           canvas.translate(mWidth / 2, mHeight / 4 * 3);
           canvas.drawCircle(mRadius * (float)Math.cos(Utils.toRadians(mAngle)), 0f, 20f, fillCirclePaint);
           canvas.restore();
   
           canvas.save();
           canvas.translate(mWidth / 2, mHeight / 4 * 3);
           float x = mRadius * (float) Math.cos(Utils.toRadians(mAngle));
           float y = mRadius * (float) Math.sin(Utils.toRadians(mAngle));
           canvas.translate(x, -y);    // 往右上方移动，因为y轴下方为正，所以取负值
   
           canvas.drawLine(0f, 0f, 0f, y, solidLinePaint);
           canvas.drawLine(0f, 0f, 0f, -(mHeight / 4 - y), dashedLinePaint);
           canvas.restore();
       }
   
       /**
        * 画正弦曲线
        * @param canvas 画笔
        */
       private void drawSinWave(Canvas canvas) {
           canvas.save();
           canvas.translate(mWidth / 2, mHeight / 2);
   
           int sampleCounts = 100;  //样本
           float dy = mHeight / 2 / sampleCounts;
           sinWaveSamplesPaint.reset();    //重置
   
           sinWaveSamplesPaint.moveTo(mRadius * (float) Math.cos(Utils.toRadians(mAngle)), 0f);
           for(int i = 0; i < sampleCounts; i++) {
               float x = mRadius * (float) Math.cos(i * -0.15 + Utils.toRadians(mAngle));
               float y = -dy * i;
               sinWaveSamplesPaint.quadTo(x, y, x, y);
           }
           canvas.drawPath(sinWaveSamplesPaint, vectorLinePaint);
   
           canvas.restore();
       }
   }
   ```

4. SurfaceView 副线程绘图

