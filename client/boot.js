/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2013  Sébastien Boisvert
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var assets = [
"config",
"index.QuadTree",
"index.BarnesHutAlgorithm",
"scene.RenderedLine",
"scene.RenderedCircle",
"scene.RenderedText",
"scene.RenderedRectangle",
"scene.Material",
"scene.Renderer",
"scene.Blit",
"scene.Blitter",
"scene.LoadingAnimation",
"scene.AnimatedRing",
"scene.RegionGateAnimation",
"PhysicsEngine",
"Distribution",
"Graphic",
"Region",
"Message",
"MessageQueue",
"DataStore",
"GraphOperator",
"PathOperator",
"LayoutEngine",
"Kmer",
"Graph",
"Vertex",
"Point",
"Inventory",
"IntegerSelectionWidget",
"TextWidget",
"SelectionWidget",
"AddressManager",
"Selector",
"Button",
"HumanInterface",
"WebDocument",
"Screen",
"Client",
"main"
] ;

var assetManager = new AssetManager();

var i = 0;
while(i < assets.length) {
	var asset = assets[i++];
	assetManager.streamContent(asset);
}

assetManager.installContent();

