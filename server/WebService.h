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

#ifndef _WebService_h
#define _WebService_h

#include <actions/WebAction.h>
#include <actions/StoreRequest.h>
#include <actions/RegionVisitor.h>
#include <actions/RegionClerk.h>
#include <actions/EarlyExplorer.h>
#include <actions/MapList.h>
#include <actions/MapSpecialist.h>
#include <actions/AnnotationFetcher.h>

#include <map>
#include <string>
using namespace std;

/**
 * The Ray Cloud Browser web service.
 *
 * This is used by the interface with the HTTP GET method.
 *
 * \author Sébastien Boisvert
 */
class WebService{

	map<string,WebAction*> m_productManager;

	StoreRequest m_storeRequest;
	RegionVisitor m_regionVisitor;
	EarlyExplorer m_earlyExplorer;
	MapList m_mapList;
	MapSpecialist m_mapSpecialist;
	AnnotationFetcher m_annotationFetcher;
	RegionClerk m_regionClerk;

	bool dispatchQuery(const char*tag,const char*queryString);
	void registerAction(const char*actionName,WebAction*actionHandler);

public:
	WebService();
	bool processQuery(const char*queryString);
};

#endif
