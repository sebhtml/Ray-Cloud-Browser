/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2013 Sébastien Boisvert
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

#ifndef _Explorer_h_
#define _Explorer_h_

#include "CommandInterface.h"

#include <map>
#include <string>
#include <set>
using namespace std;

/**
 * Obtain nearby biological objects in a indexed graph.
 *
 * \author Sébastien Boisvert
 */
class Explorer: public CommandInterface{

	void addKey(map<string,int>*objectsToProcess,string*sequenceKey,int distance,int maximumDistance,set<string>*visited);
public:
	int call(int argc,char**argv);
};

#endif
