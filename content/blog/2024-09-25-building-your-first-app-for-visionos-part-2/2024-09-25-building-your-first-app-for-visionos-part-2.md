---
title: "Building Your First App for visionOS: Part 2"
description: "In part 2 of this tutorial you'll learn how to use RealityKit and SwiftUI to display and animate a 3D bar chart in a visionOS app."
permalink: /building-your-first-app-for-visionos-part-2.html
date: 2024-09-25
tags:
    - visionOS
    - RealityKit
    - SwiftUI
draft: true
---

In part 1 of this tutorial, you learned how to set up a new **visionOS** project and create a basic user interface using **SwiftUI**. In this part, you'll learn how to use **RealityKit** and **SwiftUI** to display and animate a 3D bar chart in a **visionOS** app.

You can pickup this tutorial using the code you wrote in part 1, or download the finished project from part 1 [here](https://github.com/brendaninnis/3D-Charts-Tutorial/raw/main/part-1.zip). After part 1 you should have a project that looks like this:

{% image "./part-1-finished.png", "Part 1 Finished", null, null, [400, 600] %}

## Adding a 3D bar chart

When the user toggles the “Show Chart” button we're going to draw a 3D bar chart representing our data in the volumetric window. Since our chart will be made up of a collection of 3D objects, we'll create a root `Entity` in our `AppState` that will hold all the chart objects.

```diff-swift
 // AppState.swift
 import Foundation
+import RealityKit

 @Observable
 public class AppState {
     var isShowingChart = false
     var chartTitle = ""
     var chartContent: ChartContent = []
+    var chart = Entity()
+
+    init() {
+        // Position the chart near the bottom of the volume
+        chart.transform.translation.y -= 0.23
+    }
 }
```

Entity is a holder for 3D objects in **RealityKit**. We're going to make all the entities in our chart children of this root entity, that way we can manipulate the entire chart as a single object. When we first add the `chart: Entity` to the `RealityView` it's position (`translation`) will be in the center of the volume. Since our volume is 0.5 meters in height we move the chart down by 0.23 meters to position it near the bottom of the volume. It's helpful to keep in mind the coordinate space:

{% image "./visionos-coordinate-space.png", "visionOS Coordinate Space" %}

Next, we'll add the chart to our `RealityView`:

```diff-swift
 // ChartView.swift
 struct ChartView: View {

     var body: some View {
         RealityView { content in
-            if let entity = await loadEntity() {
-                content.add(entity)
-                entity.transform.translation.y -= 0.1
-            }
+            content.add(appState.chart)
+        } update: { content in
+            appState.updateChart()
         }
         .toolbar {
             ToolbarItemGroup(placement: .bottomOrnament) {
```

We've also added an `update` block to our `RealityView`. This allows us to update the chart when the app state changes. Any changes to app state properties within `updateChart` will cause `update` to be called. We'll implement `updateChart` in a moment.

## Drawing the chart

Before we draw the chart, we need to add to an `Entity` to our `ChartData` to represent each cell as a 3D object. Open *ChartContent.swift* and add the following code:

```diff-swift
 // ChartContent.swift
 
 import Foundation
+import RealityKit

 /// Represents a cell in the chart
 @Observable
 class ChartData {
     /// The value held this cell in the chart
     var value: String
     /// The value as a `Float` or `0` if not a number
     var floatValue: Float {
         Float(value) ?? 0
     }
+    /// Represents the data as a 3D object in a RealityKit scene
+    var entity: Entity?

     init(value: String) {
         self.value = value
```

**NOTE:** We're going to make some assumptions about our chart: 
1. We're going to treat the first `ChartRow` as a row of headings for one axis of the chart.
2. The first `ChartData` in each row will be the headings for the other axis.
3. We'll also assume that all the values in the chart are positive numbers.

Create a new Swift file called *AppState+ChartDrawing.swift* and add the following code:

```swift
// AppState+ChartDrawing.swift

import Foundation
import UIKit
import RealityKit

fileprivate extension ChartContent {
    var maxChartValue: Float {
        var result: Float = 0
        // Drop headings
        for row in dropFirst() {
            for col in row.data.dropFirst() {
                result = Swift.max(result, col.floatValue)
            }
        }
        if result <= 0 {
            result = 1
        }
        return result
    }
}

fileprivate var chartBoundsDidChange = true

extension AppState {
    /// The width and depth of a bar in meters
    private var barSize: Float { 0.05 }
    /// The height of a bar in meters
    private var barHeight: Float { barSize * 5 }
    /// The size of the gutters in between the bars
    private var barPadding: Float { barSize * 0.5 }
    /// The minimum height of a bar
    private var minBarScale: Float { 0.042 }
    
    private enum ChartColors {
        case red
        case yellow
        case green
        case blue
        
        var uiColor: UIColor {
            switch self {
            case .red:
                return .red
            case .yellow:
                return .yellow
            case .green:
                return .green
            case .blue:
                return .blue
            }
        }
                
        static var all: [ChartColors] {
            [
                .red,
                .yellow,
                .green,
                .blue,
            ]
        }
    }

    func updateChart() {
        // Calculate the greatest value to determine the height of the chart
        let maxChartValue = chartContent.maxChartValue
        
        chartContent.dropFirst().enumerated().forEach { rowIndex, row in
            draw(chartRow: row,
                 maxChartValue: maxChartValue,
                 rowIndex: rowIndex)
        }
        
        if chartBoundsDidChange {
            let bounds = chart.visualBounds(relativeTo: nil).extents
                        
            // Position the middle of the chart in the middle of the volumne
            chart.transform.translation.x = -1 * bounds.x * 0.5
            chart.transform.translation.z = -1 * bounds.z * 0.5
            
            chartBoundsDidChange = false
        }
    }
    
    private func draw(chartRow row: ChartRow,
                      maxChartValue: Float,
                      rowIndex: Int) {
        let color = ChartColors.all[rowIndex].uiColor
        
        row.data.dropFirst().enumerated().forEach { colIndex, data in
            // Determines the height of the bar
            let scale = max(data.floatValue / maxChartValue, minBarScale)
            
            drawCell(data: data,
                     scale: scale,
                     color: color,
                     rowIndex: rowIndex,
                     colIndex: colIndex)
        }
    }
    
    private func drawCell(data: ChartData,
                          scale: Float,
                          color: UIColor,
                          rowIndex: Int,
                          colIndex: Int) {
        // Create the entity if needed
        let entity = data.entity ?? {
            chartBoundsDidChange = true

            // Create a model entity for the bar
            let mesh = MeshResource.generateBox(width: barSize,
                                                height: barHeight,
                                                depth: barSize)
            let colorMaterial = SimpleMaterial(color: color,
                                               roughness: 0.3,
                                               isMetallic: false)
            let entity = ModelEntity(mesh: mesh, materials: [colorMaterial])
            
            // Set the height of the bar
            entity.transform.scale.y = scale
            // Align the bars vertically
            entity.transform.translation.y = barHeight * scale * 0.5
 
            // Position the bar in row and column position
            let x = (barSize + barPadding) * Float(colIndex) + barSize * 0.5
            let z = (barSize + barPadding) * Float(rowIndex) + barSize * 0.5
            entity.transform.translation.x = x
            entity.transform.translation.z = z
            
            // Add the entity to the chart
            chart.addChild(entity)
            
            // Store the new entity in this ChartData
            data.entity = entity
            
            return entity
        }()

        // Change the height of the bar if needed
        if entity.transform.scale.y != scale {
            var transform = entity.transform
            transform.scale.y = scale
            transform.translation.y = barHeight * scale * 0.5
            // Animate the bar height changes
            let anim = FromToByAnimation(from: entity.transform,
                                         to: transform,
                                         bindTarget: .transform)
            if let res = try? AnimationResource.generate(with: anim) {
                entity.playAnimation(res)
            }
        }
    }
}
```

For each cell we create a `ModelEntity` representing a bar in the chart using `MeshResource` to generate a box shape and `SimpleMaterial` to give it some color. We modify the entity transform to position each bar in row and column position, set it's height and align the bars so that they sit on the floor of the volume. When the height of a bar changes we use a simple **UIKit** animation to animate the change. 

Run the app and you should see a 3D bar chart in the volumetric window. Make changes to the data to see the chart update. The app should look like this:

{% image "./drawing-3d-bars.png", "Drawing 3D Bars" %}

## Drawing a base plate

The next thing we want is to be able to label the chart. We'll start by adding a base plate to the chart so our text will stand out and the chart will feel more cohesive.

