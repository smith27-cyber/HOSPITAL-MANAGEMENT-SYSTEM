package com.hms.backend.service.impl;

import com.hms.backend.entity.LaboratoryRequest;
import com.hms.backend.repository.LaboratoryRequestRepository;
import com.hms.backend.service.LaboratoryRequestService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LaboratoryRequestServiceImpl
        implements LaboratoryRequestService {

    private final LaboratoryRequestRepository laboratoryRequestRepository;

    public LaboratoryRequestServiceImpl(
            LaboratoryRequestRepository laboratoryRequestRepository) {

        this.laboratoryRequestRepository =
                laboratoryRequestRepository;
    }

    @Override
    public List<LaboratoryRequest> getAllRequests() {

        return laboratoryRequestRepository.findAll();
    }

    @Override
    public Optional<LaboratoryRequest> getRequestById(
            Long id) {

        return laboratoryRequestRepository.findById(id);
    }

    @Override
    public LaboratoryRequest createRequest(
            LaboratoryRequest request) {

        if (request.getStatus() == null ||
                request.getStatus().isBlank()) {

            request.setStatus("Pending");
        }

        if (request.getRequestedAt() == null) {

            request.setRequestedAt(
                    LocalDateTime.now()
            );
        }

        return laboratoryRequestRepository.save(
                request
        );
    }

    @Override
    public LaboratoryRequest updateRequest(
            Long id,
            LaboratoryRequest request) {

        LaboratoryRequest existingRequest =
                laboratoryRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory request not found with id: "
                                                + id
                                )
                        );

        existingRequest.setPatientId(
                request.getPatientId()
        );

        existingRequest.setPatientName(
                request.getPatientName()
        );

        existingRequest.setConsultationId(
                request.getConsultationId()
        );

        existingRequest.setDoctorId(
                request.getDoctorId()
        );

        existingRequest.setDoctorName(
                request.getDoctorName()
        );

        existingRequest.setTestId(
                request.getTestId()
        );

        existingRequest.setTestName(
                request.getTestName()
        );

        existingRequest.setCategory(
                request.getCategory()
        );

        existingRequest.setSampleType(
                request.getSampleType()
        );

        existingRequest.setStatus(
                request.getStatus()
        );

        existingRequest.setResult(
                request.getResult()
        );

        existingRequest.setNotes(
                request.getNotes()
        );

        existingRequest.setPrice(
                request.getPrice()
        );

        if (request.getRequestedAt() != null) {

            existingRequest.setRequestedAt(
                    request.getRequestedAt()
            );
        }

        existingRequest.setCompletedAt(
                request.getCompletedAt()
        );

        if ("Completed".equalsIgnoreCase(
                request.getStatus())) {

            if (existingRequest.getCompletedAt() == null) {

                existingRequest.setCompletedAt(
                        LocalDateTime.now()
                );
            }
        }

        return laboratoryRequestRepository.save(
                existingRequest
        );
    }

    @Override
    public boolean updateRequestStatus(
            Long id,
            String status) {

        LaboratoryRequest request =
                laboratoryRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory request not found with id: "
                                                + id
                                )
                        );

        /*
         * A cancelled request cannot be reopened.
         */
        if ("Cancelled".equalsIgnoreCase(
                request.getStatus())) {

            if (!"Cancelled".equalsIgnoreCase(status)) {

                return false;
            }
        }

        request.setStatus(status);

        if ("Completed".equalsIgnoreCase(status)) {

            if (request.getCompletedAt() == null) {

                request.setCompletedAt(
                        LocalDateTime.now()
                );
            }
        }

        return laboratoryRequestRepository
                .save(request) != null;
    }

    @Override
    public void deleteRequest(Long id) {

        LaboratoryRequest request =
                laboratoryRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory request not found with id: "
                                                + id
                                )
                        );

        /*
         * Protect completed requests from deletion.
         */
        if ("Completed".equalsIgnoreCase(
                request.getStatus())) {

            throw new RuntimeException(
                    "Completed laboratory requests cannot be deleted."
            );
        }

        laboratoryRequestRepository.deleteById(id);
    }

    @Override
    public List<LaboratoryRequest> getRequestsByPatient(
            Long patientId) {

        return laboratoryRequestRepository
                .findByPatientId(patientId);
    }

    @Override
    public List<LaboratoryRequest> getRequestsByConsultation(
            Long consultationId) {

        return laboratoryRequestRepository
                .findByConsultationId(consultationId);
    }

    @Override
    public List<LaboratoryRequest> getRequestsByStatus(
            String status) {

        return laboratoryRequestRepository
                .findByStatus(status);
    }

    @Override
    public List<LaboratoryRequest> getCompletedRequestsByPatient(
            Long patientId) {

        return laboratoryRequestRepository
                .findByPatientIdAndStatus(
                        patientId,
                        "Completed"
                );
    }

    @Override
    public List<LaboratoryRequest> getCompletedRequestsByConsultation(
            Long consultationId) {

        return laboratoryRequestRepository
                .findByConsultationIdAndStatus(
                        consultationId,
                        "Completed"
                );
    }
}