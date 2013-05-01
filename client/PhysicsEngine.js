/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
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

/* yet another force-directed graph viewer */
/* the code is GPL */
/* author: Sébastien Boisvert */

/**
 * The physics engine does the repulsion and
 * attraction routines.
 *
 * \author Sébastien Boisvert
 */
function PhysicsEngine(screen){

	this.lastIndex = 0;
	this.resetActiveIndex();
	this.maximumActiveObjectsToProcess=256;
	this.physicsEntryLevel=500;
/*
 * Simulate DNA annealing.
 * The annealing code is buggy.
 */
	this.simulatedAnnealing=false;
	this.screen=screen;

/*
 * We can use the quadTree along with
 * active objects.
 */
	this.useQuadTree=true;

	this.useProximity=false;
	this.useFullMap=true;

/*
 * Coulomb's law
 * This is for the repulsion.
 */
	this.charge=128;
	this.forceConstant=0.1;
	this.maximumRepulsion=64;

/*
 * Barnes-Hut algorithm
 */

	this.massForBarnesHut = 15;
	this.tetaForBarnesHut = 0.5;
	this.maximumNorm = 16;

/*
 * Hooke's law
 * This is for the springs, they keep everything together.
 * if it is too weak, the repulsion may win.
 */
	this.springConstant = 0.1;
	this.springLength = 1;
	//this.maximumAttraction = 8;
	this.enableHookLaw = true;

	/* velocity update */
	this.timeStep=1;
	this.damping=0.5;

	/* QuadTree initialisation */
	this.numberOfElementsPerNode = 16;

	// 200 M by 200 M
	this.width = 200000000;
	this.height = 200000000;
	this.centerOfQuadTree = new Point(0, 0);
	this.quadTree = new QuadTree(	this.numberOfElementsPerNode,
					this.centerOfQuadTree,
					this.width,
					this.height,
					0);

	this.barnesHut = new BarnesHutAlgorithm(this.tetaForBarnesHut);
	this.useBarnesHut = true;
}

PhysicsEngine.prototype.checkBounds=function(force, maximum){
	if(force>maximum){
		return maximum;
	}

	if(force<-maximum){
		return -maximum;
	}

	return force;
}

/**
 * \see http://en.wikipedia.org/wiki/Force-based_algorithms_(graph_drawing)
 */
PhysicsEngine.prototype.applyForces=function(vertices){

	if(this.activeIndex>=vertices.length){
		this.resetActiveIndex();
	}

	var i=0;

/*
 * Build an index.
 */
	var index=new Object();

	while(i<vertices.length){
		var vertex1=vertices[i];

		vertex1.getSequence();
		index[vertex1.getSequence()]=vertex1;
		i++;
	}

	i=0;
	var processed=0;

	while(this.activeIndex < vertices.length && processed++ < this.maximumActiveObjectsToProcess) {

		if(this.forceConstant==0)
			break;

		var vertex1 = vertices[this.activeIndex];
		this.activeIndex++;

		if(this.screen.isOutside(vertex1,this.physicsEntryLevel)) {
			continue;
		}

		var force = new Point(0, 0);

		if(this.useBarnesHut) {
			force = this.barnesHut.approximateForce(vertex1.getSequence(), vertex1.getCenter(),
				this.massForBarnesHut, this.quadTree);


			//console.log("BARNES HUT = " + force);
			//console.log("QUERY = " + force2);
		} else {
			force = this.computeRepulsionForceFirstVersion(vertex1, vertices, index);
		}

		var arcs = vertex1.getLinkedObjects();
		for(var j in arcs){
			var vertex2 = arcs[j];
			if(vertex1.getSequence() == vertex2.getSequence()) {
				continue;
			}
			force2 = this.getAttractionForce(vertex1, vertex2);

			if(this.enableHookLaw)
				force.add(force2);
		}

		if(force.getNorm() >= this.maximumNorm) {
			force.normalize();
			force.multiplyBy(this.maximumNorm);
		}

		vertex1.updateVelocity(this.timeStep, force);
	}

	if(this.activeIndex>=vertices.length){
		this.resetActiveIndex();
	}

/*
 * Apply damping on every object,
 * not just those on the screen.
 */
	var i=0;
	while(i<vertices.length){
		var vertex1=vertices[i];
		vertex1.applyDamping(this.damping);
		i++;
	}
}

/**
 * \see http://en.wikipedia.org/wiki/Hooke%27s_law
 */
PhysicsEngine.prototype.getAttractionForce = function(vertex1, vertex2){


	var dx=vertex2.getX()-vertex1.getX();
	var dy=vertex2.getY()-vertex1.getY();

	var distance=Math.sqrt(dx*dx+dy*dy);

	var displacement=distance-this.springLength;

	var force=this.springConstant*displacement;

	//force=this.checkBounds(force,this.maximumAttraction);

	// get a unit vector
	dx=dx/distance;
	dy=dy/distance;

	dx=dx*force;
	dy=dy*force;

	return new Point(dx, dy);
}

/**
 *
 * Actually, this is the Newton's law because the value in the
 * Coulomb law is divided by a cubic length 
 *
 * \see http://en.wikipedia.org/wiki/Coulomb's_law
 * \see Newton's law
 */
PhysicsEngine.prototype.getRepulsionForce=function(vertex1, charge1, vertex2, charge2){

	var dx=(vertex1.getX() - vertex2.getX());
	var dy=(vertex1.getY() - vertex2.getY());

	if(dx==0 && dy==0){
		//return new Point(0, 0);
		var value=30;
		return new Point(Math.random()*value - value,Math.random()*value - value);
	}

	var length=Math.sqrt(dx*dx+dy*dy);

	dx=dx/length;
	dy=dy/length;

	var force=(this.forceConstant*charge1*charge2)/(length*length);

	dx=dx*force;
	dy=dy*force;

	return new Point(dx, dy);
}

PhysicsEngine.prototype.addForces = function(force, force2){
	return new Point(force.getX() + force2.getX(), force.getY() + force2.getY())
}

PhysicsEngine.prototype.moveObjects=function(vertices){
	// move objects


	var maximumToProcess = 16384;
	var processed = 0;

	if(!(this.lastIndex < vertices.length))
		this.lastIndex = 0;

	var i = 0;

	// remove me
	// TODO: it would be better to only process a part of the objects

	this.lastIndex = 0;
	while(this.lastIndex < vertices.length
			&& processed < maximumToProcess){

		var vertex=vertices[this.lastIndex];

		vertex.update(this.timeStep, true);

		if(this.useQuadTree){
			this.quadTree.update(vertex.getOldCenter(), vertex.getCenter(), vertex.getSequence(), true);
		}

		this.lastIndex++;
		processed++;
		i++;
	}
}

PhysicsEngine.prototype.resetActiveIndex=function(){
	this.activeIndex=0;
}

PhysicsEngine.prototype.getQuadTree = function() {
	return this.quadTree;
}

PhysicsEngine.prototype.computeRepulsionForceFirstVersion = function(vertex1, vertices, index) {
	var force = new Point(0, 0);
	var force2 = new Point(0, 0);
	var hits = new Array();

	if(this.useQuadTree) {
		var keys = this.quadTree.queryCircle(vertex1.getCenter(), 150);
		var keyNumber = 0;
		while(keyNumber < keys.length){
			var keyValue=keys[keyNumber];
			keyNumber++;

			// We can only pick up the object if it's in the active spot.

			if(keyValue in index){
				var vertex2=index[keyValue];
				hits.push(vertex2);
			}
		}
	} else if(this.useProximity) {
		hits = vertex1.getLinkedObjects();
	} else if(this.useFullMap) {
		hits = vertices;
	}
	var hitNumber=0;
	while(hitNumber < hits.length) {
		var vertex2 = hits[hitNumber];
		hitNumber++;
		//We don't want to compute forces against the same object.
		if(vertex1.getSequence() == vertex2.getSequence()) {
			continue;
		}
		//force2 = this.getRepulsionForce(vertex1.getCenter(), this.charge, vertex2.getCenter(), this.charge);
		force2 = this.barnesHut.computeNewtonForce(vertex1.getCenter(), this.charge, vertex2.getCenter(), this.charge);

		/*
		force2=this.checkBounds(force2,this.maximumRepulsion);
		*/
		force = this.addForces(force,force2);
	}
	return force;
}
/*
PhysiqueEngine.prototype.computeRepulsedForceSecondVersion = function() {

}*/
