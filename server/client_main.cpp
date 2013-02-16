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

#include <commands/ObjectFetcher.h>
#include <commands/GraphManager.h>
#include <commands/PathHelper.h>
#include <commands/Explorer.h>
#include <commands/PathProbe.h>
#include <commands/Parser.h>

#include <iostream>
#include <map>
#include <string>
using namespace std;

void showUsage(map<string,CommandInterface*>&dispatcher){
	cout<<"This is the command dispatcher"<<endl;
	cout<<"Author: Sébastien Boisvert"<<endl;
	cout<<endl;
	cout<<"Available commands"<<endl;
	cout<<endl;
	for(map<string,CommandInterface*>::iterator i=dispatcher.begin();
		i!=dispatcher.end();i++){

		cout<<PROGRAM_NAME<<" "<<i->first<<endl;
	}
}

int main(int argc,char**argv){

	map<string,CommandInterface*> dispatcher;

	ObjectFetcher objectFetcher;
	dispatcher["commandLineClient"]=&objectFetcher;
	GraphManager graphManager;
	dispatcher["createGraphDatabase"]=&graphManager;
	PathHelper pathHelper;
	dispatcher["createPathDatabase"]=&pathHelper;
	Explorer explorer;
	dispatcher["getSubgraphWithPath"]=&explorer;
	PathProbe pathProbe;
	dispatcher["probePath"]=&pathProbe;
	Parser parser;
	dispatcher["readJSON"]=&parser;

	if(argc==1){
		showUsage(dispatcher);
		return 0;
	}

	string command=argv[1];

	if(dispatcher.count(command)==0){
		cout<<"Command "<<command<<" is not available"<<endl;
		showUsage(dispatcher);
		return 0;
	}

	int newCount=argc-1;
	char**newArguments=argv+1;

	CommandInterface*handler=dispatcher[command];

	handler->call(newCount,newArguments);

	return 0;
}
