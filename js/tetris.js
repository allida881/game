var tetris={
  OFFSET:15,//保存容器的内边距
  CSIZE:26,//保存每个格子的宽高
  shape:null,//正在下落的主角图形
  nextShape:null,//保存备胎图形
  timer:null,//保存当前动画的序号
  interval:200,//保存当前图形下落的时间间隔
  wall:null,//所有已经停止下落的方块的二维数组
  RN:20,//总行数
  CN:10,//总列数
  lines:0,//保存消除的总行数
  score:0,//保存当前得分
  SCORES:[0,10,50,120,200],
	  //  0  1  2   3  4
  state:1,//保存当前游戏状态
  RUNNING:1,//运行中
  PAUSE:2,//暂停
  GAMEOVER:0,//结束

  LN:10,//每10行一级
  LNINTERVAL:100,//每升一级，interval减100毫秒
  MIN:100,//interval的最小毫秒数
  level:1,

  start:function(){
	this.interval=1000;
	this.level=1;

	this.state=this.RUNNING;//初始化游戏状态为运行中
	this.lines=0;
	this.score=0;
	this.wall=[];//将wall初始化为空数组
	//r从0开始，到<RN结束，每次增1
	for(var r=0;r<this.RN;r++){
	   this.wall[r]=new Array(this.CN);//设置wall中r位置的行为CN个元素的空数组
    }
	//随机生成图形，保存在shape中
	this.shape=this.randomShape();
	//随机生成备胎图形，保存在nextShape中
    this.nextShape=this.randomShape();
    //调用paint绘制主角图形
	this.paint();
    //启用周期性定时器,设置任务函数为moveDown,提前绑定this,时间间隔为interval
    this.timer=setInterval(this.moveDown.bind(this),this.interval);
    //为当前页面绑定键盘按下事件
	var me=this;
    document.onkeydown=function(e){
	   switch(e.keyCode){//判断键盘号
	        case 37://左移
			    if(me.state==me.RUNNING){
				     me.moveLeft(); 
					 break;
				}
		    case 39: //右移
			    if(me.state==me.RUNNING){ 
				    me.moveRight();
					break;
				}
		    case 40://下落
			    if(me.state==me.RUNNING){
				    me.moveDown(); 
					break;
				 }
			case 38://右转
			    if(me.state==me.RUNNING){
			        me.rotateR();
					break;
				}
            case 90: //左转
			    if(me.state==me.RUNNING){
			        me.rotateL();
					break;
				}
			case 83: //启动  
			    if(me.state==me.GAMEOVER){ 
			       me.start();
				   break;
				}
		    case 80:// 暂停
			    if(me.state==me.RUNNING){ 
			         me.pause();
					 break;
				}  //如果是80: 暂停
		    case 67: //继续
			    if(me.state==me.PAUSE){ 
			        me.myContinue();
				    break;
				}
		    case 81://退出
			    if(me.state!=me.GAMEOVER){
				    me.quit();
				    break;
				}
			case 32://
			    if(me.state==me.RUNNING){
				    me.hardDrop();
					break;
				}
        }
    }
  }, 
  hardDrop:function(){//一落到地
    while(this.canDown()){
	   this.shape.moveDown();
	}
	this.paint();
  },
  myContinue:function(){//继续
	console.log("tt");
    this.state==this.RUNNING;
	this.paint();
  },
  pause:function(){//暂停
    this.state==this.PAUSE;
	this.paint();
  },
  canRotate:function(){//检查能否旋转
	//遍历当前图形中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      //将当前图形临时保存在变量cell中
      var cell=this.shape.cells[i];
      //如果cell的r>19或cell.r<0或cell.c<0或cell.c>9
        //或在wall中和c相同位置不为空
      if(cell.r<0||cell.r>19||cell.c<0||cell.c>9
          ||this.wall[cell.r][cell.c]!==undefined){
        return false;//就返回false
      }
    }//(遍历结束)
    return true;//就返回true
  },
  rotateR:function(){//专门负责右转一次
     this.shape.rotateR();//调用shape的rotateR方法
	//如果不能旋转,让shape再左转回来
	//否则
	   //重绘一切
     !this.canRotate()?this.shape.rotateL():this.paint();
  },
  rotateL:function(){//专门负责左转一次
    this.shape.rotateL();//调用shape的rotateL方法
	//如果不能旋转,让shape再右转回来
   //否则,重绘一切
    !this.canRotate()?this.shape.rotateR():this.paint();
  },
  canLeft:function(){
     //遍历当前主角的每个cell
	 for(var i=0;i<this.shape.cells.length;i++){
	   var cell=this.shape.cells[i];
	   if(cell.c==0||this.wall[cell.r][cell.c-1]!==undefined){ //cell的c！=0//wall中的左侧没有
	     return false;//return false
	   }
     }
	return true;
  },
  moveLeft:function(){//专门负责左移一次
    if(this.canLeft()){
	   this.shape.moveLeft();//让shape左移一次
	   this.paint(); //重绘一切
	}
  },
  canRight:function(){
     //遍历当前主角的每个cell
	 for(var i=0;i<this.shape.cells.length;i++){
	   var cell=this.shape.cells[i];
	   if(cell.c==this.CN-1||this.wall[cell.r][cell.c+1]!==undefined){ //cell的c！=0//wall中的左侧没有
	     return false;//return false
	   }
     }
	return true;
  }, 
  moveRight:function(){//专门负责右转一次
    if(this.canRight()){
	   this.shape.moveRight();//让shape右移一次
	   this.paint(); //重绘一切
	}
  },
  canDown:function(){//专门用于检测能否下落
    //遍历shape中每个cell
	for(var i=0;i<this.shape.cells.length;i++){
		//首先将当前cell临时存储在变量cell中
		var cell=this.shape.cells[i];
		//如果cell的r已经等于19
		//或wall中cell的下方位置不等于underfined
		if(cell.r==19||this.wall[cell.r+1][cell.c]!==undefined){
		   return false; //返回false  
		}
	}//遍历结束
	return true;//返回true
  },
  quit:function(){//游戏结束
    this.state=this.GAMEOVER; //修改游戏状态为GAMEOVER
	clearInterval(this.timer);//停止定时器
	this.timer=null;
	this.paint();
  },
  moveDown:function(){//负责将图形下落一次
	//如果游戏正在运行中
    if(this.state==this.RUNNING){
		if(this.canDown()){//如果可以下落
		    this.shape.moveDown();//调用shape的moveDown方法
		}else{//否则(不能下落)
			  //调用landIntoWall，将shape放入墙中
			this.landIntoWall();
			//调动deleteRows判断并删除满格行
			var ln=this.deleteRows();
			this.lines+=ln;//将ln累加到lines中
			this.score+=this.SCORES[ln];
			if(this.lines>this.level*this.LN){//如果lines>level*LN
			   this.level++;//level+1
			   if(this.interval>this.MIN){
			   this.interval-=this.LNINTERVAL;//将interval-LNINTERVAL
			   clearInterval(this.timer);//停止定时器
			   this.timer=setInterval(//重新启动定时器
				   this.moveDown().bind(this),this.interval);
			   }
			}
			if(this.isGameOver()){//如果游戏结束
				this.quit();
			}else{//否则
				  //备胎转正
				this.shape=this.nextShape;
				this.nextShape=this.randomShape();//生成新的备胎
			} 
	    }
	    this.paint();//调用paintShape，绘制主角图形
    }
  },
  paintState:function(){//专门根据游戏装填，显示图片
    if(this.state==this.PAUSE){//如果当前游戏状态为PAUSE
	   //创建一个新Image对象,保存在变量img中
	   var img=new Image();
	   img.src="img/pause.png";//设置img的src为pause.png
	   pg.appendChild(img);//将img追加到pg下
	}else if(this.state==this.GAMEOVER) {//否则，如果当前游戏状态为GAMEOVER
	   //创建一个新Image对象,保存在变量img中
	   var img=new Image();
	   img.src="img/game-over.png";//设置img的src为game-over.png
	   pg.appendChild(img);//将img追加到pg下
	}
  },
  isGameOver:function(){
    for(var i=0;i<this.nextShape.cells.length;i++){//遍历备胎图形中的每个cell
	   var cell=this.nextShape.cells[i];
	   if(this.wall[cell.r][cell.c]!==undefined)//如果wall中cell相同位置有格
	      return true;//返回true
    }//遍历结束
	return false;//返回false
  },
  paintNext:function(){//赋值备胎图形
    //创建文档片段，保存在变量frag中
	var frag=document.createDocumentFragment();
    //遍历shape的cells数组中的每个cell对象
	for(var i=0;i<this.nextShape.cells.length;i++){
	  //将当前格子保存在变量cell中
	  var cell=this.nextShape.cells[i];
	  //创建一个新Image对象，保存在变量img中
	  var img=new Image();
	  //设置img的src为cell的src
	  img.src=cell.src;
	  //设置img的top为OFFSET+cell的r*CSIZE
	  img.style.top=this.OFFSET+(cell.r+1)*this.CSIZE+"px";
	  //设置img的left为OFFSET+cell的c*CSIZE
	  img.style.left=this.OFFSET+(cell.c+10)*this.CSIZE+"px";
	  //将img追加到frag中
	  frag.appendChild(img);
	}//遍历结束
	//将frag追加到id为pg的元素下
	pg.appendChild(frag);
  },
  paintScore:function(){//刷到页面上
    //设置id为lines的元素的内容为lines属性
    lines.innerHTML=this.lines;
    //设置id为score的元素的内容为score属性
    score.innerHTML=this.score;
	level.innerHTML=this.level;
  },
  deleteRows:function(){//遍历所有行，检查能否消除
    //自底向上遍历wall中每一行，同时声明变量ln=0
    ////如果wall中r行无缝拼接后，为"",就直接break
	for(var r=this.RN-1,ln=0; r>=0&&this.wall[r].join("")!="";r--){ 
	   if(this.isFull(r)){//如果当前行满格
	      this.deleteRow(r);//删除第r行
		  r++;//让r留在原地
		  ln++;//ln++
		  if(ln==4){ break;}//如果ln等于4了，就退出循环
	   }
	}//遍历结束
	return ln;//返回ln
  },
  deleteRow:function(delr){//删除第r行
	 //r从delr开始,到r>0结束,每次r-1
	 for(var r=delr;r>0;r--){
	    //将wall中r-1行赋值给wall中r行
		this.wall[r]=this.wall[r-1];
		//创建一个CN元素的空数组赋值给wall中r-1行
		this.wall[r-1]=new Array(this.CN);
		//遍历wall中r行每个格
		for(var c=0;c<this.CN;c++){
		   //将当前格保存在cell中
		   var cell=this.wall[r][c];
		   //如果cell有效，将cell的r+1
		   cell!=undefined && cell.r++;
		    
		}//遍历结束
	   //如果wall中r-2行是空行，就退出循环
	     //就直接break;
       if(this.wall[r-2].join("")==""){break;}    
	 }
  },
  isFull:function(r){//专门判断第r行是否满格
     var reg=/^,|,,|,$/g;
	 //返回wall中r行转为字符串后，用search查找，是否包含reg，与-1
	 return String(this.wall[r]).search(reg)==-1;
	 
  },
  randomShape:function(){//专门随机创建一个图形
    // return new O();
	//生成随机数在0~2之间，保存在变量r中
	var r=parseInt(Math.random()*3);
	switch(r){//判断r
	   //如果是0:,返回一个新的O类型的图形对象
       case 0:  return new O();
	   //如果是1:,返回一个新的I类型的图形对象
	   case 1:  return new I();
	   //如果是2:,返回一个新的T类型的图形对象
	   case 2:  return new T();
	   case 3:  return new J();
       case 4:  return new L();
	   case 5:  return new Z();
	   case 6:  return new S();
	}
	
  },
  landIntoWall:function(){//专门负责将主角放入wall中
	//遍历shape中每个cell
	for(var i=0;i<this.shape.cells.length;i++){
	   //将当前变量临时存储在变量cell中
	   var cell=this.shape.cells[i];
	   //将当前cell赋值给wall中相同位置
	   this.wall[cell.r][cell.c]=cell;
	}
  },
  paintWall:function(){//专门负责绘制墙中所有方块
	//创建文档片段frag
	var frag=document.createDocumentFragment();
    //自底向上遍历wall中每行的每个cell
	for(var r=(this.RN-1);r>=0&&this.wall[r].join("")!=="";r--){
	   //如果wall中r行无缝拼接后，为""
	   //遍历wall中r行每个格
	   for(var i=0;i<this.CN;i++){
	   //将当前格子保存在变量cell中
		  var cell=this.wall[r][i];
		  if(cell){//如果cell有效
			  //创建一个新Image对象，保存在变量img中
			  var img=new Image();
			  //设置img的src为cell的src
			  img.src=cell.src;
			  //设置img的top为OFFSET+cell的r*CSIZE
			  img.style.top=this.OFFSET+cell.r*this.CSIZE+"px";
			  //设置img的left为OFFSET+cell的c*CSIZE
			  img.style.left=this.OFFSET+cell.c*this.CSIZE+"px";
			  //将img追加到frag中
			  frag.appendChild(img);
			}
		 }
	   
	}//遍历结束
	//将frag追加到id为pg的元素下
	pg.appendChild(frag);
  },
  paint:function(){//重绘一切
    //清除pg中所有的img元素
	var reg=/<img[^>]*>/g; //定义正则 /<img[^>]*>/g
	pg.innerHTML=pg.innerHTML.replace(reg,"");//用reg删除pg的内容中所有img，将结果再保存回pg的内容中
	this.paintShape();//调用paintShape绘制主角图形
    this.paintWall();//绘制墙
	this.paintScore();//绘制分数
	this.paintNext();//绘制备胎
	this.paintState();//绘制游戏状态
  },
  paintShape:function(){//专门绘制主角图形
	//创建文档片段，保存在变量frag中
	var frag=document.createDocumentFragment();
    //遍历shape的cells数组中的每个cell对象
	for(var i=0;i<this.shape.cells.length;i++){
	  //将当前格子保存在变量cell中
	  var cell=this.shape.cells[i];
	  //创建一个新Image对象，保存在变量img中
	  var img=new Image();
	  //设置img的src为cell的src
	  img.src=cell.src;//设置img的src为cell的src
	  //设置img的top为OFFSET+cell的r*CSIZE
	  img.style.top=this.OFFSET+cell.r*this.CSIZE+"px";
	  //设置img的left为OFFSET+cell的c*CSIZE
	  img.style.left=this.OFFSET+cell.c*this.CSIZE+"px";
	  //将img追加到frag中
	  frag.appendChild(img);
	}//遍历结束
	//将frag追加到id为pg的元素下
	pg.appendChild(frag);
  },
}
window.onload=function(){
  tetris.start();
}