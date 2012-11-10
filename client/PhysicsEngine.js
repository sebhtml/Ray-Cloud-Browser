/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012  Sébastien Boisvert
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

function PhysicsEngine(arcLength){

	this.arcLength=arcLength;
	this.useGrid=false;
	this.range=5;

	/* Coulomb's law */
	this.forceStep=0.05;
	this.charge=100;
	this.forceConstant=0.15;

	/* Hooke's law */
	this.sprintStep=0.005;
	this.springConstant=0.05;

	/* velocity update */
	this.timeStep=1;
	this.damping=0.5;

	this.grid=new Grid(100);
}

/**
 * \see http://en.wikipedia.org/wiki/Force-based_algorithms_(graph_drawing)
 */
PhysicsEngine.prototype.applyForces=function(vertices){

	var i=0;

	while(i<vertices.length){
		var force=[0,0];

		var vertex1=vertices[i];

/*
 * Actually, hits should be obtained with the grid.
 */
		var hits=vertices;

		var vertexRadius=vertex1.getRadius();

		if(this.useGrid){
			hits=this.grid.getEntries(vertex1.getX(),vertex1.getY(),this.range*vertexRadius,this.range*vertexRadius);
		}

		var k=0;
		//console.log("Self= "+i);
		while(this.forceConstant!=0 && k<hits.length){
			var j=k;
			if(this.useGrid){
				var j=hits[k];
			}

			if(i==j){
				k++;
				continue;
			}

			//console.log("self= "+i+" hit= "+j);
			var vertex2=vertices[j];

			var force2=this.getRepulsionForce(vertex1,vertex2);

			force=this.addForces(force,force2);
		
			k++;
		}

		var arcs=vertex1.getLinkedObjects();

		for(j in arcs){

			var vertex2=arcs[j];

			var force2=this.getAttractionForce(vertex1,vertex2);

			force=this.addForces(force,force2);
		}

		vertex1.updateVelocity(this.timeStep,force,this.damping);

		i++;
	}

}

/**
 * \see http://en.wikipedia.org/wiki/Hooke%27s_law
 */
PhysicsEngine.prototype.getAttractionForce=function(vertex1,vertex2){


	var dx=vertex2.getX()-vertex1.getX();
	var dy=vertex2.getY()-vertex1.getY();

	var distance=Math.sqrt(dx*dx+dy*dy);

	var displacement=distance-this.arcLength;


	var force=this.springConstant*displacement;

	// get a unit vector 
	dx=dx/distance;
	dy=dy/distance;


	dx=dx*force;
	dy=dy*force;

	return [dx,dy];
}

/**
 * \see http://en.wikipedia.org/wiki/Coulomb's_law
 */
PhysicsEngine.prototype.getRepulsionForce=function(vertex1,vertex2){

	var dx=(vertex1.getX() - vertex2.getX());
	var dy=(vertex1.getY() - vertex2.getY());
	
	var length=Math.sqrt(dx*dx+dy*dy);

	dx=dx/length;
	dy=dy/length;

	var charge1=this.charge;
	var charge2=this.charge;
	var force=(this.forceConstant*charge1*charge2)/(length*length);

	dx=dx*force;
	dy=dy*force;

	return [dx,dy];
}



PhysicsEngine.prototype.addForces=function(force,force2){
	return [force[0]+force2[0], force[1]+force2[1]]
}

PhysicsEngine.prototype.moveObjects=function(vertices){
	// move objects

	var i=0;
	while(i<vertices.length){
		var vertex=vertices[i];
		
		vertex.update(this.timeStep,true);

		var scale=this.range*vertex.getRadius();

		if(this.useGrid){
			this.grid.removeEntry(i);

			//console.log("vertices "+this.vertices.length+" i= "+i+" name= "+vertex.getName());
			this.grid.addEntry(i,vertex.getX(),vertex.getY(),scale,scale);
		}

		i++;
	}
}


