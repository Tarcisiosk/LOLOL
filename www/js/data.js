var version = "7.12.1"
var api_key = "RGAPI-6961d14e-e866-43dd-8dd6-f58bdf408b95"
var match_num = 10;

var baron_kills = 0;
var dragon_kills = 0;
var herald_kills = 0;
var tower_kills = 0;
var inhibitor_kills = 0;
var first_barons = 0;
var first_dragons = 0;
var first_towers = 0;
var first_blood = 0;
var wins = 0;

var total_assists      = 0;     
var total_deaths       = 0;      
var total_kills        = 0;       
var total_minions      = 0;     
var total_killing      = 0;     
var total_inhibitors   = 0;  
var total_turrets      = 0;     
var total_wards_kill   = 0;  
var total_wards_placed = 0;
var time_living        = 0;

var accountId = 0;
var championIds = [];
var matchIds = [];
var lanes = [];

var pleaseWait = $('#pleaseWaitDialog'); 
var dataModal = $('#dataDialog'); 

function SearchSummoner(name){
    $.ajax({
        url:'https://br1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+name+'?api_key='+api_key,
        method: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        processData: false,
        success: function(data){
            if(data.summonerLevel >= 30){
                PopulateSummoner(data);
                accountId = data.accountId;
                SearchMatches(accountId);
            } else {
                ShowMessage("É necessário ter nível 30 para completar esta ação!");
            }
        },
        error: function(data){
            ShowMessage("Não foi possível encontrar este invocador. Verifique se foi digitado corretamente e tente novamente!");
        }
    });
}

function PopulateSummoner(data){
    $("#summoner_div").show();
    $("#sum_img").attr("src", "http://ddragon.leagueoflegends.com/cdn/"+version+"/img/profileicon/"+data.profileIconId+".png");
    $("#sum_name").text(data.name);
    $("#sum_level").text("Level: " + data.summonerLevel);
};

function SearchMatches(accId){
    $.ajax({
        url:'https://br1.api.riotgames.com/lol/match/v3/matchlists/by-account/'+accId+'/?season=9&api_key='+api_key,
        method: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        async: false,
        success: function(data){
            FetchMatchData(data.matches.slice(0, match_num));
        },
        error: function(data){
            ShowMessage("Ocorreu um erro interno. Por gentileza, tente novamente mais tarde!");
        }
    });
    pleaseWait.modal('hide');
    FillHtml();
    dataModal.modal('show');
    ClearValues();
}

function FetchMatchData(matches){
    $.each(matches, function(i, match){
        championIds.push(match.champion);
        matchIds.push(match.gameId);
        lanes.push(match.lane);
        $.ajax({
            url:'https://br1.api.riotgames.com/lol/match/v3/matches/'+match.gameId+'?api_key='+api_key,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            processData: false,
            async: false,
            success: function(data){
                player = data.participants[FindParticipant(data.participantIdentities)-1]
                FetchPlayerStats(player.stats);
                if(player.teamId == 100){
                    FetchTeamStats(data.teams[0]);
                } else {
                    FetchTeamStats(data.teams[1]);
                }
            },
            error: function(data){
                ShowMessage("Ocorreu um erro interno. Por gentileza, tente novamente mais tarde!");
            }
        });
        championIds.push(match.champion);
    });
    matches = [];
}

function FindParticipant(ptids, pts){
    var playerId = 0;
    $.each(ptids, function(i, obj){
        if(obj.player.accountId == accountId){
            playerId = obj.participantId;
        }
    });
    return playerId;
}

function FetchTeamStats(team){
    baron_kills     += team.baronKills;
    dragon_kills    += team.dragonKills;
    herald_kills    += team.riftHeraldKills;
    tower_kills     += team.towerKills;
    inhibitor_kills += team.inhibitorKills;
    if(team.firstBaron){
        first_barons++;
    }
    if(team.firstDragon){
        first_dragons++;
    }
    if(team.firstTower){
        first_towers++;
    }
    if(team.firstBlood){
        first_blood++;
    }
    if(team.win == "Win"){
        wins++;
    }
}

function FetchPlayerStats(playerStats){
    total_assists      += playerStats.assists;
    total_deaths       += playerStats.deaths;
    total_kills        += playerStats.kills;
    total_minions      += playerStats.totalMinionsKilled;
    total_inhibitors   += playerStats.inhibitorKills;
    total_turrets      += playerStats.turretKills;
    total_wards_kill   += playerStats.wardsKilled;
    total_wards_placed += playerStats.wardsPlaced;
    if(playerStats.killingSprees > total_killing){
        total_killing = playerStats.killingSprees;        
    }
    if(playerStats.longestTimeSpentLiving > time_living){
        time_living = playerStats.longestTimeSpentLiving;        
    }   
}

function SetChampionsHtml(){
    $.each(Array.from(new Set(championIds)), function(i, champ) {
        var name = "";
        $.ajax({
            url:'https://br1.api.riotgames.com/lol/static-data/v3/champions/'+champ+'?api_key='+api_key,
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            processData: false,
            async: false,
            success: function(data){
                name = data.key;
            },
            error: function(data){
                ShowMessage("Ocorreu um erro interno. Por gentileza, tente novamente mais tarde!");
            }
        });
        var source = "http://ddragon.leagueoflegends.com/cdn/"+version+"/img/champion/"+name+".png"
        var img = "<img src="+source+" height='50' width='50'/>";
        $('#champs').prepend(img);
    });
}

function FillHtml(){
    SetChampionsHtml();
    $('#baron_kills').text(baron_kills.toString()); 
    $('#dragon_kills').text(dragon_kills.toString()); 
    $('#herald_kills').text(herald_kills.toString()); 
    $('#tower_kills').text(tower_kills.toString()); 
    $('#inhibitor_kills').text(inhibitor_kills.toString()); 
    $('#first_barons').text(first_barons.toString()); 
    $('#first_dragons').text(first_dragons.toString()); 
    $('#first_towers').text(first_towers.toString()); 
    $('#first_blood').text(first_blood.toString()); 
    $('#wins').text(wins.toString()); 
   
    $('#total_assists').text(total_assists.toString()); 
    $('#m_total_assists').text("Média\n"(total_assists/match_num).toString()+" por partida");
   
    $('#total_deaths').text(total_deaths.toString()); 
    $('#m_total_deaths').text((total_deaths/match_num).toString()+" por partida");
    
    $('#total_kills').text(total_kills.toString());
    $('#m_total_kills').text((total_kills/match_num).toString()+" por partida");

    $('#total_minions').text(total_minions.toString()); 
    $('#m_total_minions').text((total_minions/match_num).toString()+" por partida");
   
    $('#total_inhibitors').text(total_inhibitors.toString()); 
    $('#m_total_inhibitors').text((total_inhibitors/match_num).toString()+" por partida");

    $('#total_turrets').text(total_turrets.toString()); 
    $('#m_total_turrets').text((total_turrets/match_num).toString()+" por partida");

    $('#total_wards_kill').text(total_wards_kill.toString()); 
    $('#m_total_wards_kill').text((total_wards_kill/match_num).toString()+" por partida");

    $('#total_wards_placed').text(total_wards_placed.toString()); 
    $('#m_total_wards_placed').text((total_wards_placed/match_num).toString()+" por partida");

    $('#total_killing').text(total_killing.toString()); 
    $('#time_living').text(Math.floor(time_living/60).toString()+" minutos"); 
}

function GetFormattedDate(timestamps){
    var data = new Date(timestamps);
    var dia = data.getDate();
    if (dia.toString().length == 1){
        dia = "0"+dia;
    }
    var mes = data.getMonth()+1;
    if (mes.toString().length == 1){
        mes = "0"+mes;
    }
    var ano = data.getFullYear();  
    return dia+"/"+mes+"/"+ano;
}

function ShowMessage(message){
    pleaseWait.modal('hide');
    BootstrapDialog.show({
        title: "Ocorreu um erro!",
        message: message
    });
}

function ClearValues(){
    baron_kills = 0;
    dragon_kills = 0;
    herald_kills = 0;
    tower_kills = 0;
    inhibitor_kills = 0;
    first_barons = 0;
    first_dragons = 0;
    first_towers = 0;
    first_blood = 0;
    wins = 0;

    total_assists      = 0;     
    total_deaths       = 0;      
    total_kills        = 0;       
    total_minions      = 0;     
    total_killing      = 0;     
    total_inhibitors   = 0;  
    total_turrets      = 0;     
    total_wards_kill   = 0;  
    total_wards_placed = 0;
    time_living        = 0;

    accountId = 0;
    championIds = [];
    matchIds = [];
    lanes = [];
}







