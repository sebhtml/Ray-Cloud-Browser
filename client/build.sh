#!/bin/bash
# see https://developers.google.com/closure/
# thanks to Jean-Sébastien A. Beaudry for pointing this great tool


#--js ./boot.js \
#--js ./tests/Assert.js \
#--js ./tests/test_quadtree.js \

java -jar ~/software/closure-javascript/compiler.jar \
--compilation_level ADVANCED_OPTIMIZATIONS \
--js ./Point.js \
--js ./Kmer.js \
--js ./Grid.js \
--js ./Region.js \
--js ./Screen.js \
--js ./Message.js \
--js ./PathOperator.js \
--js ./AssetManager.js \
--js ./Button.js \
--js ./LayoutEngine.js \
--js ./PhysicsEngine.js \
--js ./config.js \
--js ./GraphOperator.js \
--js ./WebDocument.js \
--js ./DataStore.js \
--js ./AddressManager.js \
--js ./Graph.js \
--js ./Vertex.js \
--js ./HumanInterface.js \
--js ./Inventory.js \
--js ./Selector.js \
--js ./MessageQueue.js \
--js ./Graphic.js \
--js ./Client.js \
--js ./index/QuadTree.js \
--js ./index/BarnesHutAlgorithm.js \
--js ./SelectionWidget.js \
--js ./scene/AnimatedRing.js \
--js ./scene/RenderedRectangle.js \
--js ./scene/Renderer.js \
--js ./scene/RenderedLine.js \
--js ./scene/RegionGateAnimation.js \
--js ./scene/LoadingAnimation.js \
--js ./scene/RenderedText.js \
--js ./scene/Blitter.js \
--js ./scene/Blit.js \
--js ./scene/Material.js \
--js ./scene/RenderedCircle.js \
--js ./main.js \
--js ./IntegerSelectionWidget.js \
--js ./Distribution.js \
--js ./TextWidget.js \
> CompiledClient.js
