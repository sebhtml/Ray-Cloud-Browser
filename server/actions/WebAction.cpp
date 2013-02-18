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

#include "WebAction.h"

#include <string.h>

bool WebAction::getValue(const char*query,const char*name,char*value,int maximumValueLength)const{

	for(int i=0;i<(int)strlen(query);i++){
		bool match=true;

		//cout<<"Query+i: "<<query+i<<endl;
		//cout<<"Name:    "<<name<<endl;

		for(int j=0;j<(int)strlen(name);j++){
			if(query[i+j]!=name[j]){
				match=false;
				break;
			}
		}

		//cout<<"Match: "<<match<<endl;

		if(match){
			int startingPosition=i+strlen(name)+1;
			int endingPosition=startingPosition;
			while(endingPosition<(int)strlen(query)){
				if(query[endingPosition]=='&')
					break;
				endingPosition++;
			}
			int count=endingPosition-startingPosition;

/* somebody is trying to break in */

			if(count>maximumValueLength)
				return false;

			//cout<<"Value= "<<query+startingPosition<<endl;
			//cout<<"Count= "<<count<<endl;

			memcpy(value,query+startingPosition,count);
			value[count]='\0';

			return true;
		}
	}
	
	return false;
}

bool WebAction::isAllowedFile(const char*file)const{

// no absolute paths
	if(file[0]=='/')
		return false;

	int length=strlen(file);

// no relative paths with '..'
	for(int i=0;i<length-2;i++){
		if(file[i]=='.' && file[i+1]=='.')
			return false;
	}

	return true;

/* we don't care for the next two rules */
#if 0
// must be something + .dat
	if(length<=4) 
		return false;

// must end with .dat
	if(!(
		/**/file[length-4]=='.'
		&&file[length-3]=='d'
		&&file[length-2]=='a'
		&&file[length-1]=='t')){

		return false;
	}
	
	return true;
#endif
}


