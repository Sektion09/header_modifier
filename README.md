# header_modifier

This is an extension for chrome to modify request headers for XmlHttpRequests and main_frame request.
You can also set a url regex filter to apply the header modification only to matching request urls.
It also allows you to add profiles with multiple request headers and multiple url filters.
The data ist stored in local storage and not synchronized between browser instances with the same google profile.

You can also import profiles with the following structure:

```
{
	"title": "ProfileName",
	"headers": [
		{
			"enabled": true,
			"name": "User2",
			"value": "admin",
		},
		{
			"enabled": false,
			"name": "User2",
			"value": "admin",
		}
		
	],
	"urlFilters": [],
}
```

Import of multiple profilesat once is also possible:

[
	{
    	"title": "ProfileName",
    	"headers": [
    		{
    			"enabled": true,
    			"name": "User",
    			"value": "admin",
    		},
    		{
    			"enabled": false,
    			"name": "User2",
    			"value": "admin2",
    		}
    		
    	],
    	"urlFilters": [],
    },
    {
    	"title": "ProfileName2",
    	"headers": [
    		{
    			"enabled": true,
    			"name": "User3",
    			"value": "admin3",
    		},
    		{
    			"enabled": false,
    			"name": "User4",
    			"value": "admin4",
    		}
    		
    	],
    	"urlFilters": [],
    }
]