package com.university.thesis.service.impl;

import com.university.thesis.entity.Thesis;
import com.university.thesis.repository.CouncilRepository;
import com.university.thesis.repository.ThesisRepository;
import com.university.thesis.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final ThesisRepository thesisRepository;
    private final CouncilRepository councilRepository;

    @Override
    public List<Map<String, Object>> getScoresByYear() {
        List<Thesis> allTheses = thesisRepository.findAll();

        Map<String, List<Thesis>> byYear = allTheses.stream()
                .filter(t -> t.getAverageScore() != null)
                .collect(Collectors.groupingBy(Thesis::getAcademicYear));

        return byYear.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    List<Thesis> theses = entry.getValue();
                    double avg = theses.stream().mapToDouble(Thesis::getAverageScore).average().orElse(0.0);

                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("year", entry.getKey());
                    item.put("avgScore", Math.round(avg * 100.0) / 100.0);
                    item.put("count", theses.size());
                    return item;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getByMajor() {
        List<Thesis> allTheses = thesisRepository.findAll();

        Map<String, Long> byMajor = allTheses.stream()
                .filter(t -> t.getMajor() != null)
                .collect(Collectors.groupingBy(Thesis::getMajor, Collectors.counting()));

        return byMajor.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("major", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new LinkedHashMap<>();
        List<Thesis> allTheses = thesisRepository.findAll();

        overview.put("totalThesis", allTheses.size());
        overview.put("totalCouncils", councilRepository.count());

        List<Thesis> completed = allTheses.stream()
                .filter(t -> t.getAverageScore() != null)
                .collect(Collectors.toList());
        overview.put("completed", completed.size());

        long inProgress = allTheses.size() - completed.size();
        overview.put("inProgress", inProgress);

        if (!completed.isEmpty()) {
            double avg = completed.stream().mapToDouble(Thesis::getAverageScore).average().orElse(0);
            overview.put("avgScore", Math.round(avg * 100.0) / 100.0);
        }
        return overview;
    }
}
