﻿/**
 * LineChartRenderer
 * 
 * @classdesc Renders points in a form of line chart.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, ITimeAxis } from '../core/index';
import { IDataIterator } from '../data/index';
import { Point } from '../model/index';
import { IPoint, IRect } from '../shared/index';
import { IChartRender } from './Interfaces';
import { SettingSet } from "../core/SettingSet";

export class LineChartRenderer implements IChartRender<Point> {

    public render(
        canvas: ICanvas,
        dataIterator: IDataIterator<Point>,
        //data: Point[],
        frame: IRect,
        timeAxis: ITimeAxis,
        yAxis: IAxis<number>): void {

        // // Render
        // //
        // // border lines
        // canvas.beginPath();
        // canvas.setStrokeStyle('#333333');
        // // ... left
        // canvas.moveTo(frame.x, frame.y);
        // canvas.lineTo(frame.x, frame.y + frame.h - 1);
        // // ... bottom
        // canvas.lineTo(frame.x + frame.w - 1, frame.y + frame.h - 1);
        // // ... right
        // canvas.lineTo(frame.x + frame.w - 1, frame.y);
        // canvas.stroke();

        // // Start drawing
        // canvas.beginPath();
        // canvas.setStrokeStyle('#555555');

        // if (dataIterator.moveNext()) {
        //     let x = timeAxis.toX(dataIterator.current.date);
        //     let y = yAxis.toX(<number>dataIterator.current.value);
        //     canvas.moveTo(x, y);
        //     while (dataIterator.moveNext()) {
        //         if (dataIterator.current.value) {
        //             x = timeAxis.toX(dataIterator.current.date);
        //             y = yAxis.toX(<number>dataIterator.current.value);
        //             canvas.lineTo(x, y);
        //         }
        //     }
        // }
        // canvas.stroke();
    }

    public testHitArea(
        hitPoint: IPoint,
        dataIterator: IDataIterator<Point>,
        //data: Point[],
        frame: IRect,
        timeAxis: ITimeAxis,
        yAxis: IAxis<number>): Point | undefined {

        // while (dataIterator.moveNext()) {
        //     if (dataIterator.current.value) {

        //         const x = timeAxis.toX(dataIterator.current.date);
        //         const y = yAxis.toX(dataIterator.current.value);

        //         const R = Math.sqrt(Math.pow(Math.abs(x - hitPoint.x), 2) + Math.pow(Math.abs(y - hitPoint.y), 2));
        //         if (R < 2) {
        //             return dataIterator.current;
        //         }
        //     }
        // }
        return undefined;
    }


    public getSettings(): SettingSet {
        return new SettingSet('renderer');
    }

    public setSettings(settings: SettingSet): void {
    }    
}
