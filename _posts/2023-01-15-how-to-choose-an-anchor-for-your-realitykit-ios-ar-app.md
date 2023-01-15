---
layout: post
title: "How to choose an anchor for your RealityKit iOS AR app"
description: "Learn how to choose an anchor for your scene instead of placing it on the first anchor found"
permalink: /how-to-choose-an-anchor-for-your-realitykit-ios-app.html
categories:
  - iOS
  - AR
tags:
  - RealityKit
  - Swift
  - ARKit
  - iOS
---

If you are like me, you created a RealityKit AR app using the Xcode template *Augmented Reality App* under _New Project_. This template project includes a basic Reality Composer _Experience.rcproject_ file which is loaded into the app and added to the Scene's anchors. This will anchor the scene to the first horizontal surface that is found. I wanted to know how to choose which surface my scene would be anchored to, and this blog post will explain how I did it, as well as discussing the
details of anchoring virtual content to the real world.

## ARAnchors and AnchorEntities

No one can be told what The Matrix is, you have to see it for yourself. To easily visualize and understand anchors, add the following debug options to your `ARView` and run the app:
```swift
let config = ARWorldTrackingConfiguration()
config.planeDetection = [.horizontal, .vertical]
arView.session.run(config)

// debug options are powerful tools for understanding RealityKit
arView.debugOptions = [
    .showAnchorOrigins,
    .showAnchorGeometry
]
```

The template augmented reality project in Xcode loads an `AnchorEntity` for your scene, and adds it to the Scene's anchors collection:

```swift
// Load the "Box" scene from the "Experience" Reality File
let boxAnchor = try! Experience.loadBox()

// Add the box anchor to the scene
arView.scene.anchors.append(boxAnchor)
```

An `AnchorEntity` is used to attach virtual content to the real world. It is an `Entity` which extists in the hierarchy of your Scene, usually as a direct child of the Scene, meaning that your content will exist as children or descendents of your anchor entity. 

An `AnchorEntity` anchors itself to the real world using something called an `ARAnchor`. An `ARAnchor` is a fixed place within the real world you can attach content to, such as a hoziontal surface like a table. An
`AnchorEntity` is created with a target describing the type of `ARAnchor` it is looking to attach to:

```swift
// Attach to any horizonal surface of any size
let anchorEntity = AnchorEntity(.plane(.horizontal, classification: .any, minimumBounds: SIMD2(repeating: 0)))

// Attach to a horizonal floor surface with at least 1m square bounds
let anchorEntity = AnchorEntity(.plane(.horizontal, classification: .floor, minimumBounds: SIMD2(repeating: 1)))

// Attach to a person's body
let anchorEntity = AnchorEntity(.body)

```

By default, the reality file scene is looking for a horizontal anchor. It will attach itself to the first anchor it finds, but that may not be what you want. Maybe you want to be able to pick which surface your scene will attach to. In order to do this, you will need to look for an anchor and attach your scene to it.

## ARSessionDelegate

You can know about when `ARAnchor`s are found by setting a delegate on your `ARSession` and implementing the `ARSessionDelegate` protocol methods.

First, configure your `ARSession` for world tracking, using the `ARWorldTrackingConfiguration`. We will use plane detection to find horizontal planes, suitable for placing our scene:
```swift
    let config = ARWorldTrackingConfiguration()
    config.planeDetection = [.horizontal]
    arView.session.run(config)
```

Now, any detected horizontal planes will be delivered to your `ARSessionDelegate` methods:
```swift
// MARK: - ARSessionDelegate

extension MySceneManager: ARSessionDelegate {
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        for anchor in anchors {
            guard let plane = anchor as? ARPlaneAnchor,
                  plane.alignment == .horizontal else {
                continue
            }
            print("Found horizontal plane \(plane)")
        }
    }
    
    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        for anchor in anchors {
            guard let plane = anchor as? ARPlaneAnchor,
                  plane.alignment == .horizontal else {
                continue
            }
            print("Updated horizontal plane \(plane)")
        }
    }
    
    func session(_ session: ARSession, didRemove anchors: [ARAnchor]) {
        for anchor in anchors {
            guard let plane = anchor as? ARPlaneAnchor,
                  plane.alignment == .horizontal else {
                continue
            }
            print("Lost horizontal plane \(plane)")
        }
    }
}
```

## Anchoring your scene

Now that you can find anchors, you have many options to place your scene. You can look at the qualities of the anchors, and decide which one to attach your scene to, or you could have some kind of user input guide the placement of your AR content in the real world. 

When you are ready to attach your content to an anchor, you can create a new `AnchorEntity` using that anchor. You can then simply add your loaded Reality Composer scene as a child of that anchor entity. Remember that an
`AnchorEntity` is just an Entity. It doesn't have to be anchored itself, it can simply be the child of another entity, like the anchor entity you create yourself:

```swift
let boxAnchor = try! Experience.loadBox()
let myAnchorEntity = AnchorEntity(anchor: anchor)
myAnchorEntity.addChild(boxAnchor)
```

## Tap to place your scene

An easy way to select an anchor for your scene is to allow the user to tap the view, and then select the first horizontal plane hit by a raycast projected from the camera to place our scene:

```swift
// Capture taps to place the scene
let recognizer = UITapGestureRecognizer(target: self,
                                        action: #selector(self.viewTapped(_:)))
arView.addGestureRecognizer(recognizer)

// . . .

@objc private func viewTapped(_ recognizer: UITapGestureRecognizer) {
    guard !arView.manager.sceneAttached else {
        return
    }
    let point = recognizer.location(in: arView)
    guard let anchor = arView.raycast(from: point,
                                      allowing: .existingPlaneInfinite,
                                      alignment: .horizontal).first?.anchor else {
        return
    }
    // Use the planar surface found to anchor your scene
}
```

## Putting it all together

All of the concepts discussed in this guide are demonstrated in a repo available on my [GitHub](https://github.com/brendaninnis/choosing-an-anchor-realitykit).

Apple's augmented reality modules are still very new, and not widely used within the app ecosystem yet. This means that guides and documentation can be difficult to find. Apple does have some nice help available scattered throughout the documentation, but it can be difficult to approach for the first time. When working with augmented reality, you should prepare yourself to dig deeply within the documentation, read the public APIs available for each class and accept that you will slowly
come to understand how to use Apple's AR.
