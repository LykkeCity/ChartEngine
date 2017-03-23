//
// Plugin for drawing circles
// Defines:
//      CircleFigureComponent class
//      and states:
//      DrawCircleState,
//      EditCircleState.
//
(function(){

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var CircleFigureComponent = (function () {

    var _super = lychart.FigureComponent;

    __extends(CircleFigureComponent, _super);  // extends FigureComponent

    function CircleFigureComponent(area, offset, size, timeAxis, yAxis) {
        var self = _super.call(this, offset, size) || this;
        self.area = area;
        self.timeAxis = timeAxis;
        self.yAxis = yAxis;
        self.isHovered = false;
        self.pa = new lychart.drawing.PointFigureComponent(area, offset, size, timeAxis, yAxis);
        self.pb = new lychart.drawing.PointFigureComponent(area, offset, size, timeAxis, yAxis);
        self.addChild(self.pa);
        self.addChild(self.pb);
        return self;
    }
    Object.defineProperty(CircleFigureComponent.prototype, "pointA", {
        get: function () {
            return this.pa.point;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircleFigureComponent.prototype, "pointB", {
        get: function () {
            return this.pb.point;
        },
        enumerable: true,
        configurable: true
    });
    CircleFigureComponent.prototype.isHit = function (x, y) {
            if (!this.pa.point.t || !this.pa.point.v || !this.pb.point.t || !this.pb.point.v) {
                return false;
            }

            var ax = this.timeAxis.toX(this.pa.point.t);
            var bx = this.timeAxis.toX(this.pb.point.t);
            var ay = this.yAxis.toX(this.pa.point.v);
            var by = this.yAxis.toX(this.pb.point.v);

            var radius = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
            var distance = Math.sqrt((x - ax) * (x - ax) + (y - ay) * (y - ay));

            return Math.abs(radius - distance) < 3;
    };
    CircleFigureComponent.prototype.setPopupVisibility = function (visible) {
        this.isHovered = visible;
    };
    CircleFigureComponent.prototype.render = function (context, renderLocator) {
        // only render on front
        if (!context.renderFront) {
            return;
        }
        if (this.pa.point.t && this.pa.point.v && this.pb.point.t && this.pb.point.v) {
            var ax = this.timeAxis.toX(this.pa.point.t);
            var ay = this.yAxis.toX(this.pa.point.v);
            var bx = this.timeAxis.toX(this.pb.point.t);
            var by = this.yAxis.toX(this.pb.point.v);

            var radius = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));

            var canvas = this.area.frontCanvas;
            canvas.beginPath();
            canvas.arc(ax, ay, radius, 0, 2 * Math.PI, false);

            if (this.isHovered) {
                canvas.setStrokeStyle('#000BEF');
            } else {
                canvas.setStrokeStyle('#FF0509');
            }

            canvas.stroke();
            canvas.closePath();
        }
        _super.prototype.render.call(this, context, renderLocator);
    };
    CircleFigureComponent.prototype.getEditState = function () {
        return editState;
    };
    return CircleFigureComponent;
}());    


var DrawCircleState = (function () {
    function DrawCircleState() {
        this.mouse = new lychart.core.Mouse();
    }

    DrawCircleState.prototype.onMouseWheel = function (board, mouse) { };
    DrawCircleState.prototype.onMouseMove = function (board, mouse) {
        _a = [mouse.x, mouse.y], this.mouse.x = _a[0], this.mouse.y = _a[1];
        if (this.line && this.chartStack) {
            var timeNumberCoords = this.chartStack.mouseToCoords(mouse.x - board.offset.x - this.chartStack.offset.x, mouse.y - board.offset.y - this.chartStack.offset.y);
            if (timeNumberCoords.t && timeNumberCoords.v) {
                this.line.pointB.t = timeNumberCoords.t;
                this.line.pointB.v = timeNumberCoords.v;
            }
        }
        var _a;
    };
    DrawCircleState.prototype.onMouseEnter = function (board, mouse) {
        this.mouse.isEntered = true;
    };
    DrawCircleState.prototype.onMouseLeave = function (board, mouse) {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
    };
    DrawCircleState.prototype.onMouseUp = function (board, mouse) {
        this.mouse.isDown = false;
        this.line = undefined;
        this.chartStack = undefined;
        this.exit(board, mouse);
    };
    DrawCircleState.prototype.onMouseDown = function (board, mouse) {
        this.mouse.isDown = true;
        _a = [mouse.x, mouse.y], this.mouse.x = _a[0], this.mouse.y = _a[1];
        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x - board.offset.x, mouse.y - board.offset.y);
        if (this.chartStack) {
            this.line = this.chartStack.addFigure(function (area, offset, size, timeAxis, yAxis) {
                return new CircleFigureComponent(area, offset, size, timeAxis, yAxis);
            });
            var timeNumberCoords = this.chartStack.mouseToCoords(mouse.x - board.offset.x - this.chartStack.offset.x, mouse.y - board.offset.y - this.chartStack.offset.y);
            this.line.pointA.t = timeNumberCoords.t;
            this.line.pointA.v = timeNumberCoords.v;
            this.line.pointB.t = timeNumberCoords.t;
            this.line.pointB.v = timeNumberCoords.v;
        }
        var _a;
    };
    DrawCircleState.prototype.activate = function (board, mouse) {
        _a = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered], this.mouse.x = _a[0], this.mouse.y = _a[1], this.mouse.isDown = _a[2], this.mouse.isEntered = _a[3];
        var _a;
    };
    DrawCircleState.prototype.deactivate = function (board, mouse) { };
    DrawCircleState.prototype.exit = function (board, mouse) {
        board.changeState('hover');
    };
    return DrawCircleState;
}());


var EditCircleState = (function () {
    function EditCircleState() {
        this.mouse = new lychart.core.Mouse();
    }

    EditCircleState.prototype.onMouseWheel = function (board, mouse) { };
    EditCircleState.prototype.onMouseMove = function (board, mouse) {
        if (this.line && this.chartStack) {
            var timeNumberCoords = this.chartStack.mouseToCoords(mouse.x - board.offset.x - this.chartStack.offset.x, mouse.y - board.offset.y - this.chartStack.offset.y);
            // Calculate difference

            if (timeNumberCoords.t && timeNumberCoords.v
                && this.currentCoords && this.currentCoords.t && this.currentCoords.v
                && this.line.pointA.t && this.line.pointA.v && this.line.pointB.t && this.line.pointB.v) {
                var tdiff = timeNumberCoords.t.getTime() - this.currentCoords.t.getTime();
                var vdiff = timeNumberCoords.v - this.currentCoords.v;
                this.line.pointA.t = new Date(this.line.pointA.t.getTime() + tdiff);
                this.line.pointA.v = this.line.pointA.v + vdiff;
                this.line.pointB.t = new Date(this.line.pointB.t.getTime() + tdiff);
                this.line.pointB.v = this.line.pointB.v + vdiff;
                this.currentCoords = timeNumberCoords;
            }
        }
        else {
            console.debug('Edit state: line or chartStack is not found.');
        }
        this.mouse.x = mouse.x;
        this.mouse.y = mouse.y;
    };
    EditCircleState.prototype.onMouseEnter = function (board, mouse) {
        this.mouse.isEntered = true;
    };
    EditCircleState.prototype.onMouseLeave = function (board, mouse) {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
    };
    EditCircleState.prototype.onMouseUp = function (board, mouse) {
        this.mouse.isDown = false;
        this.exit(board, mouse);
    };
    EditCircleState.prototype.onMouseDown = function (board, mouse) {
        this.mouse.isDown = true;
    };
    EditCircleState.prototype.activate = function (board, mouse, activationParameters) {
        _a = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered], this.mouse.x = _a[0], this.mouse.y = _a[1], this.mouse.isDown = _a[2], this.mouse.isEntered = _a[3];
        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x - board.offset.x, mouse.y - board.offset.y);
        if (this.chartStack) {
            this.currentCoords = this.chartStack.mouseToCoords(mouse.x - board.offset.x - this.chartStack.offset.x, mouse.y - board.offset.y - this.chartStack.offset.y);
        }
        else {
            throw new Error('Can not find hit chart stack.');
        }
        if (activationParameters && activationParameters['component']) {
            this.line = activationParameters['component'];
        }
        else {
            throw new Error('Editable component is not specified for edit.');
        }
        var _a;
    };
    EditCircleState.prototype.deactivate = function (board, mouse) { };
    EditCircleState.prototype.exit = function (board, mouse) {
        this.line = undefined;
        this.chartStack = undefined;
        board.changeState('hover');
    };
    return EditCircleState;
})();

// Create instances for states
let editState = new EditCircleState();
let drawState = new DrawCircleState();

// Register figure
lychart.states.register('circle', drawState);
})();