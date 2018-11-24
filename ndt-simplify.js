/*
 * NDT Simplify
 * Created and developed by the Nonamian Development Team - https://nonamiandevteam.000webhostapp.com/
 * Built using p5.js - https://p5js.org/
*/

var NDTSimplify = {};

NDTSimplify.Scene = class {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		this.elements = [];

		this.backgroundColor = "white";

		this.keys = [];
	}

	addElement(element) {
		this.elements.push(element);
	}

	update() {
		NDTSimplify.time.update();

		for (let el of this.elements) {
			el.update();
		}

		background(this.backgroundColor);
		for (let el of this.elements) {
			push();
			translate(el.x, el.y);
			el.draw();
			pop();
		}
	}

	mouseClick() {
		for (let el of this.elements) {
			if (mouseX > el.x && mouseX < el.x + el.w &&
					mouseY > el.y && mouseY < el.y + el.h) {
				el.event_click();
			}
		}
	}

	keyPress() {
		this.keys.push(keyCode);
	}

	keyRelease() {
		for (let i = 0; i < this.keys.length; i++) {
			if (this.keys[i] === keyCode) {
				this.keys.splice(i, 1);
			}
		}
	}

	getKey(key) {
		for (let i = 0; i < this.keys.length; i++) {
			if (this.keys[i] === NDTSimplify.keyCodes[key]) {
				return true;
			}
		}
		return false;
	}
}

NDTSimplify.Element = class {
	constructor(scene, x, y, w, h) {
		this.scene = scene;
		scene.addElement(this);

		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.xv = 0;
		this.yv = 0;

		this.event_hitElement = function() {};
		this.event_hitBorder = function() {};
		this.event_click = function() {};

		this.resetUpdate();
		this.draw = function() {
			rect(0, 0, this.w, this.h);
		}

		this.shouldStayOnScreen = false;
	}

	updatePos() {
		this.x += this.xv * NDTSimplify.time.delta;

		for (let el of this.scene.elements) {
			if (this.touching(el)) {
				this.event_hitElement(el, this.xv > 0 ? "right" : "left");
			}
		}

		this.y += this.yv * NDTSimplify.time.delta;

		for (let el of this.scene.elements) {
			if (this.touching(el)) {
				this.event_hitElement(el, this.yv > 0 ? "bottom" : "top");
			}
		}
	}

	updateEvents() {
		if (this.x + this.w > this.scene.width) {
			this.event_hitBorder("right");
			if (this.shouldStayOnScreen) {
				this.x = this.scene.width - this.w;
			}
		} else if (this.x < 0) {
			this.event_hitBorder("left");
			if (this.shouldStayOnScreen) {
				this.x = 0;
			}
		}

		if (this.y + this.h > this.scene.height) {
			this.event_hitBorder("bottom");
			if (this.shouldStayOnScreen) {
				this.y = this.scene.height - this.h;
			}
		} else if (this.y < 0) {
			this.event_hitBorder("top");
			if (this.shouldStayOnScreen) {
				this.y = 0;
			}
		}
	}

	controlWithMouse(axis) {
		if (typeof axis === "undefined") {
			this.update = function() {
				this.x = mouseX - this.w / 2;
				this.y = mouseY - this.h / 2;
				this.updateEvents();
			}
		} else if (axis === "x") {
			this.update = function() {
				this.x = mouseX - this.w / 2;
				this.updateEvents();
			}
		} else if (axis === "y") {
			this.update = function() {
				this.y = mouseY - this.h / 2;
				this.updateEvents();
			}
		}
	}

	controlWithKeys(speed = 150, controls = {right:"rightarrow",
			left:"leftarrow", down:"downarrow", up:"uparrow"}, axis) {
		this.speed = speed;
		this.controls = controls;
		if (typeof axis === "undefined") {
			this.update = function() {
				this.xv = 0;
				this.yv = 0;
				if (this.scene.getKey(this.controls.right)) {
					this.xv += this.speed;
				}
				if (this.scene.getKey(this.controls.left)) {
					this.xv -= this.speed;
				}
				if (this.scene.getKey(this.controls.down)) {
					this.yv += this.speed;
				}
				if (this.scene.getKey(this.controls.up)) {
					this.yv -= this.speed;
				}
				this.updatePos();
				this.updateEvents();
			}
		} else if (axis === "x") {
			this.update = function() {
				this.xv = 0;
				if (this.scene.getKey(this.controls.right)) {
					this.xv += this.speed;
				}
				if (this.scene.getKey(this.controls.left)) {
					this.xv -= this.speed;
				}
				this.updatePos();
				this.updateEvents();
			}
		} else if (axis === "y") {
			this.update = function() {
				this.yv = 0;
				if (this.scene.getKey(this.controls.down)) {
					this.yv += this.speed;
				}
				if (this.scene.getKey(this.controls.up)) {
					this.yv -= this.speed;
				}
				this.updatePos();
				this.updateEvents();
			}
		}
	}

	platformerControls(speed = 150, jumpForce = 750, gravity = 2500, controls =
			{right:"rightarrow", left:"leftarrow", jump:"uparrow"}) {
		this.platformer = true;
		this.speed = speed;
		this.jumpForce = jumpForce;
		this.gravity = gravity;
		this.controls = controls;
		this.falling = true;

		this.update = function() {
			this.xv = 0;
			this.yv += this.gravity * NDTSimplify.time.delta;

			if (this.scene.getKey(this.controls.right)) {
				this.xv += this.speed;
			}
			if (this.scene.getKey(this.controls.left)) {
				this.xv -= this.speed;
			}
			if (!this.falling && this.scene.getKey(this.controls.jump)) {
				this.yv = -this.jumpForce;
			}

			this.falling = true;
			this.updatePos();
			this.updateEvents();
		}
	}

	resetUpdate() {
		this.update = function() {
			this.updatePos();
			this.updateEvents();
		}
	}

	reflect(axis) {
		if (axis === "x") {
			this.xv *= -1;
		} else if (axis === "y") {
			this.yv *= -1;
		}
	}

	stop(axis) {
		if (axis !== "y") {
			this.xv = 0;
		}
		if (axis !== "x") {
			this.yv = 0;
		}
	}

	collide(el, axis) {
		if (axis === "x") {
			if (this.xv > 0) {
				this.x = el.x - this.w;
			} else {
				this.x = el.x + el.w;
			}
		} else if (axis === "y") {
			if (this.yv > 0) {
				this.y = el.y - this.h;
			} else {
				this.y = el.y + el.h;
			}
		}
	}

	collideWith(obj) {
		if (obj === "elements") {
			this.event_hitElement = function(el, side) {
				if (side === "right" || side === "left") {
					this.collide(el, "x");
					this.stop("x");
				} else {
					this.collide(el, "y");
					this.stop("y");
					if (this.platformer && side === "bottom") {
						this.falling = false;
					}
				}
			}
		} else if (obj === "borders") {
			this.shouldStayOnScreen = true;
			this.event_hitBorder = function(border) {
				if (border === "right" || border === "left") {
					this.stop("x");
				} else {
					this.stop("y");
				}
			}
		}
	}

	reflectOff(obj) {
		if (obj === "elements") {
			this.event_hitElement = function(el, side) {
				if (side === "right" || side === "left") {
					this.collide(el, "x");
					this.reflect("x");
				} else {
					this.collide(el, "y");
					this.reflect("y");
				}
			}
		} else if (obj === "borders") {
			this.shouldStayOnScreen = true;
			this.event_hitBorder = function(border) {
				if (border === "right" || border === "left") {
					this.reflect("x");
				} else {
					this.reflect("y");
				}
			}
		}
	}

	touching(el) {
		return el !== this && this.x + this.w > el.x && this.x < el.x + el.w &&
			this.y + this.h > el.y && this.y < el.y + el.h;
	}
}

NDTSimplify.time = {
	update: function() {
		this.delta = (millis() - this._last) / 1000;
		this._last = millis();
	}
};

NDTSimplify.keyCodes = {backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,pausebreak:19,capslock:20,esc:27,space:32,pageup:33,pagedown:34,end:35,home:36,leftarrow:37,uparrow:38,rightarrow:39,downarrow:40,insert:45,delete:46,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,leftwindowkey:91,rightwindowkey:92,selectkey:93,numpad0:96,numpad1:97,numpad2:98,numpad3:99,numpad4:100,numpad5:101,numpad6:102,numpad7:103,numpad8:104,numpad9:105,multiply:106,add:107,subtract:109,decimalpoint:110,divide:111,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,numlock:144,scrolllock:145,semicolon:186,equalsign:187,comma:188,dash:189,period:190,forwardslash:191,graveaccent:192,openbracket:219,backslash:220,closebracket:221,singlequote:222};

NDTSimplify.init = function() {
	NDTSimplify.time._last = millis();
}