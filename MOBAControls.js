class MOBAControls{
    /***
     * dom
     * target
     * panSpeed
     */
    constructor(camera, params){
        this.camera = camera
        this.container = params.dom || document.body
        
        // 需要视角跟随的物体
        this.target = params.target
        // 注释点位置 同panoffset
        this.lookAtTarget = this.target.position.clone()
        //相机初始位置
        this.cameraOriginPosition = this.camera.position.clone()
        // 目前相机位置
        this.position = this.cameraOriginPosition.clone().add(this.target)

        this.camera.position.copy(this.position)

        this.camera.lookAt(this.target)
        //平移速度
        this.panSpeed = params.panSpeed || 1
        //缩放视野
        this.zoom = 1 // 暂时不写这个功能

        //记录鼠标位置
        this.panStart = new THREE.Vector2()
        this.panEnd = new THREE.Vector2()
        this.panDelta = new THREE.Vector2()
        //表示在平移进程中
        this.panStartFlag = false

        // this.container.addEventListener('mousedown', this.onMouseDown, false)
        // this.container.addEventListener('mousemove', this.onMouseMove, false)
        // this.container.addEventListener('mouseup', this.onMouseUp, false)
        // // 解决鼠标跑出浏览器的问题
        // this.container.addEventListener('mouseout', this.onMouseUp, false)
        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)

        this.container.addEventListener('touchstart', this.onTouchStart, false)
        this.container.addEventListener('touchmove', this.onTouchMove, false)
        this.container.addEventListener('touchend', this.onTouchEnd, false)


        // this.container.addEventListener('contextmenu', this.onContextMenu, false)
    }

    
    /**
     *操作规范
     相机视野始终跟随target

     // 根据屏幕大小确定使用哪种方式控制模型
     // pc模式鼠标拖拉控制视角，方向键控制模型移动，拖拉时模型跟随失效
     // 移动端模式，单手模型移动，双手视野移动

     双指控制视野的移动，这个时候视野跟随失效
     *
     * @memberof MOBAControls
     */

    onContextMenu(e){ // 屏蔽右键功能
        e.preventDefault()
        console.log('you')
    }

    onMouseDown(e){
        e.preventDefault()
        this.panStartFlag = true
        this.panStart.set(e.clientX, e.clientY)
    }

    onMouseMove(e){
        e.preventDefault()

        if(!this.panStartFlag) return

        this.panEnd.set(e.clientX, e.clientY)

        this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)

        let {x, y} = this.panDelta

        this.pan(x, y)

        this.panStart.copy(this.panEnd)

    }

    onMouseUp(e){
        e.preventDefault()
        this.panStartFlag = false
    }

    onTouchStart(e){
        e.preventDefault()
        console.log(e.touches.length)
        if(e.touches.length >= 2){
            let touch = e.touches[1]
            this.panStart.set(touch.pageX, touch.pageY)
            this.panStartFlag = true
        }
    }

    onTouchMove(e){
        e.preventDefault()
        if(!this.panStartFlag) return

        if(e.touches.length >= 2){
            let touch = e.touches[1]
            this.panEnd.set(touch.pageX, touch.pageY)
            this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)
    
            let {x, y} = this.panDelta
            this.pan(x, y)
    
            this.panStart.copy(this.panEnd)
        }else{
            this.panStartFlag = false
        }

    }

    onTouchEnd(e){
        e.preventDefault()
        this.panStartFlag = false
    }

    onMouseWheel(e){
        e.preventDefault()
    }

    panLeft(distance){
        let v = new THREE.Vector3()

        let cameraMatrix = this.camera.matrix
        v.setFromMatrixColumn( cameraMatrix, 0 )
        v.multiplyScalar( - distance )

        this.lookAtTarget.add( v )
    }

    panUp(distance){
        let v = new THREE.Vector3()

        let cameraMatrix = this.camera.matrix
        v.setFromMatrixColumn( cameraMatrix, 0 )
        v.crossVectors( this.camera.up, v )
        v.multiplyScalar( distance )

        this.lookAtTarget.add( v )
    }

    pan(x, y){
        let offset = new THREE.Vector3()

        if(this.camera.isPerspectiveCamera){
            offset.subVectors(this.camera.position, this.lookAtTarget)

            let distance = offset.length() * Math.tan(this.camera.fov * 0.5 * Math.PI / 180)
            this.panLeft( 2 * x * distance / this.container.clientHeight)
			this.panUp( 2 * y * distance / this.container.clientHeight)
        }

    }

    update(){
        if(!this.panStartFlag){
            this.lookAtTarget.copy(this.target.position)
        }
        this.position.copy(this.cameraOriginPosition.clone().add(this.lookAtTarget))
        this.camera.position.copy(this.position)
        this.camera.lookAt(this.lookAtTarget)
    }


    dispose(){
        // this.container.removeEventListener('mousedown', this.onMouseDown, false)
        // this.container.removeEventListener('mousemove', this.onMouseMove, false)
        // this.container.removeEventListener('mouseup', this.onMouseUp, false)

        this.container.removeEventListener('touchstart', this.onTouchStart, false)
        this.container.removeEventListener('touchmove', this.onTouchMove, false)
        this.container.removeEventListener('touchend', this.onTouchEnd, false)

        // this.container.removeEventListener('contextmenu', this.onContextMenu, false)
        // this.container.removeEventListener('mouseout', this.onMouseUp, false)
    }
}

// export default MOBAControls