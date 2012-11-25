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

#include "GraphDatabase.h"

#include <iostream>
using namespace std;

int main(int argc,char**argv){

	if(argc!=3){
		cout<<"Usage: "<<argv[0]<<" kmers.dat key"<<endl;
		return 0;
	}

	char*dataFile=argv[1];
	char*key=argv[2];

	GraphDatabase database;
	database.setDataFile(dataFile);

	VertexObject vertex;

	bool found = database.getObject(&vertex,key);

	cout<<"{"<<endl;

	if(found){
		cout<<"\""<<key<<"\": ";
		vertex.writeContentInJSON(&cout);
	}

	cout<<endl;
	cout<<"}"<<endl;

	return 0;
}
