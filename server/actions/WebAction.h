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

#ifndef _WebAction_h
#define _WebAction_h

#define CONFIG_MAXIMUM_VALUE_LENGTH 256
#define CONFIG_MAXIMUM_OBJECTS_TO_PROCESS 4096

/**
 * This is the virtual interface for implementing actions
 * that are available in the endpoint of the web service.
 *
 * \author Sébastien Boisvert
 */
class WebAction{

public:

	bool getValue(const char*query,const char*name,char*value,int maximumValueLength)const;
	bool getValueAsInteger(const char*query,const char*name,int*value)const;
	bool isAllowedFile(const char*file)const;

	virtual bool call(const char*queryString)=0;
};

#endif
